const mongoose = require("mongoose");
const serviceModel = require("../models/ServiceListing");
const bookingModel = require("../models/Booking");
const notification=require("../models/Notification");

const createBooking = async (req, res) => {
    try {
        const { serviceId, scheduledDate, estimatedUnits } = req.body;

        // 1. Basic validation
        if (!serviceId || !scheduledDate || !estimatedUnits) {
            return res.status(400).json({
                message: "Missing required fields: serviceId, scheduledDate, estimatedUnits"
            });
        }

        // 2. Validate MongoDB ID format
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

        // 5. Check availability toggle
        if (!service.isAvailable) {
            return res.status(400).json({
                message: "Equipment is not available"
            });
        }

        // 🎯 5.1. AVAILABILITY & CONFLICT CHECK (Same-day booking guard)
        const dateObj = new Date(scheduledDate);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({
                message: "Invalid scheduledDate format"
            });
        }

        const startOfDay = new Date(new Date(scheduledDate).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(scheduledDate).setHours(23, 59, 59, 999));

        const conflictingBooking = await bookingModel.findOne({
            serviceId: service._id,
            scheduledDate: { $gte: startOfDay,$lte: endOfDay },
            status: { $in: ["REQUESTED", "ACCEPTED", "IN_PROGRESS"] }
        });

        if (conflictingBooking) {
            return res.status(409).json({
                message: "Equipment is already booked or requested for this date",
                conflict: {
                    date: conflictingBooking.scheduledDate,
                    status: conflictingBooking.status
                }
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
        // Add this right before "return res.status(201)..." in createBooking:
await Notification.create({
    recipientId: service.providerId,
    senderId: req.user.id,
    bookingId: newBooking._id,
    type: "BOOKING_REQUEST",
    title: "New Equipment Rental Request",
    message: `A farmer has requested to book your ${service.title} for ${scheduledDate}.`
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

// Also fix: In getMyBookings and getProviderRequests, update "phone" to "mobile" to match your User schema
const getMyBookings = async (req, res) => {
    try {
        const bookings = await bookingModel
            .find({ renterId: req.user.id })
            .populate("serviceId", "title category pricing images")
            .populate("providerId", "name mobile email")
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

const getProviderRequests = async (req, res) => {
    try {
        const requests = await bookingModel
            .find({ providerId: req.user.id })
            .populate("serviceId", "title category pricing images")
            .populate("renterId", "name mobile email")
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

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, completionOtp } = req.body;

        const validStatus = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status update"
            });
        }

        const booking = await bookingModel.findById(id).select("+completionOtp");
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        const isProvider = booking.providerId.toString() === req.user.id;
        const isRenter = booking.renterId.toString() === req.user.id;

        if (!isProvider && !isRenter) {
            return res.status(403).json({
                message: "Unauthorized access for updating this booking"
            });
        }

        if (status === "COMPLETED") {
            if (!isProvider) {
                return res.status(403).json({
                    message: "Only provider can make status as completed"
                });
            }
            if (!completionOtp || completionOtp !== booking.completionOtp) {
                return res.status(400).json({
                    message: "Invalid or missing otp"
                });
            }
        }

        if (status === "CANCELLED" && booking.status === "COMPLETED") {
            return res.status(400).json({
                message: "Cannot cancel a completed booking"
            });
        }

        booking.status = status;
        await booking.save();
        // Add this right before "return res.status(200)..." in updateBookingStatus:
const targetRecipient = isProvider ? booking.renterId : booking.providerId;
await Notification.create({
    recipientId: targetRecipient,
    senderId: req.user.id,
    bookingId: booking._id,
    type: "BOOKING_STATUS",
    title: `Booking ${status}`,
    message: `Your booking for machinery has been marked as ${status}.`
});
        return res.status(200).json({
            message: `Booking status is updated ${status}`,
            data: booking
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};

module.exports = { 
    createBooking, 
    getMyBookings, 
    getProviderRequests, 
    updateBookingStatus 
};