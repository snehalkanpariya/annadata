const mongoose = require("mongoose");
const serviceModel = require("../models/ServiceListing");
const bookingModel = require("../models/Booking");

const createBooking = async (req, res) => {
    try {
        const { serviceId, scheduledDate, estimatedUnits } = req.body;

        // 1. Basic validation
        if (!serviceId || !scheduledDate || !estimatedUnits) {
            return res.status(400).json({
                message: "Missing required fields: serviceId, scheduledDate, estimatedUnits"
            });
        }

        // 2. Validate MongoDB ID format to prevent CastError crash
        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({
                message: "Invalid serviceId format"
            });
        }

        // 3. Find service
        const service = await serviceModel.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                message: "Equipment listing not found"
            });
        }

        // 4. Check self-booking
        if (service.providerId.toString() === req.user.id) {
            return res.status(400).json({
                message: "You cannot book your own equipment"
            });
        }

        // 5. Check availability
        if (!service.isAvailable) {
            return res.status(400).json({
                message: "Equipment is not available"
            });
        }

        const totalAmount = (service.pricing?.rate || 0) * Number(estimatedUnits);
        const completionOtp = Math.floor(1000 + Math.random() * 9000).toString();

        // 6. Create booking document
        const newBooking = await bookingModel.create({
            serviceId: service._id,
            providerId: service.providerId,
            renterId: req.user.id,
            scheduledDate: new Date(scheduledDate),
            estimatedUnits: Number(estimatedUnits),
            totalAmount,
            completionOtp
        });

        return res.status(201).json({
            message: "Booking request confirmed",
            data: newBooking
        });

    } catch (err) {
        console.error("❌ CRASH IN createBooking:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};
const getMyBookings = async (req, res) => {
    try {
        const bookings = await bookingModel
            .find({ renterId: req.user.id })
            .populate("serviceId", "title category pricing images")
            .populate("providerId", "name phone email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};

// 2. Get incoming booking requests for the provider's equipment
const getProviderRequests = async (req, res) => {
    try {
        const requests = await bookingModel
            .find({ providerId: req.user.id })
            .populate("serviceId", "title category pricing images")
            .populate("renterId", "name phone email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: requests.length,
            data: requests
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};
const updateBookingStatus=async(req,res)=>{
    try{
        const {id}=req.params
        const {status,completionOtp}=req.body

        const validStatus=['ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED']
        if(!validStatus.includes(status)){
            return res.status(400).json({
                message:"Invalid status update"
            })
        }
        const booking=await bookingModel.findById(id).select("+completionOtp")
        if(!booking){
            return res.status(400).json({
                message:"Booking not found"
            })
        }
        const isProvider=booking.providerId.toString()===req.user.id
        const isRenter=booking.renterId.toString()===req.user.id

        if(!isProvider&&!isRenter){
            return res.status(403).json({
                message:"Unauthorized access for updating this booking"
            })
        }
        if(status==="COMPLETED"){
            if(!isProvider){
                return res.status(403).json({
                    message:"Only provider can make status as completed"
                })
            }
            if(!completionOtp || completionOtp!==booking.completionOtp){
                return res.status(400).json({
                    message:"Invalid or missing otp"
                })
            }

        }
        if(status==="CANCELLED" && booking.status==="COMPLETED"){
            return res.status(400).json({
                message:"Cannot cancel a completed booking"
            })
        }
        booking.status=status
        await booking.save()
        return res.status(200).json({
            message:`Booking status is updated ${status}`,
            data:booking
        })

    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error:err.message
        })
    }
}

module.exports = { createBooking,getMyBookings,getProviderRequests,updateBookingStatus};