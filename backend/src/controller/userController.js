const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userModel = require("../models/User");
const Booking = require("../models/Booking");
const ServiceListing = require("../models/ServiceListing");

const register = async (req, res) => {
    try {
        const { name, mobile, password, role, longitude, latitude, address } = req.body;
        
        if (!name || !mobile || !password || longitude == undefined || latitude == undefined) {
            return res.status(400).json({
                success: false,
                message: 'Fill out required details'
            });
        }
        
        const alreadyExists = await userModel.findOne({ mobile });
        if (alreadyExists) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists with this phone number'
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            mobile,
            password: hashedPassword,
            role: role || "FARMER",
            location: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address: address || ""
            }
        });
        
        await newUser.save();
        
        return res.status(200).json({
            success: true,
            message: 'Details are saved successfully',
            data: {
                id: newUser._id,
                name: newUser.name,
                mobile: newUser.mobile,
                role: newUser.role
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};

const getDashboardMetrics = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication context."
            });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const user = await userModel.findById(userObjectId).select("name mobile role");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // If user is a PROVIDER
        if (user.role === "PROVIDER") {
            const listingStats = await ServiceListing.aggregate([
                { $match: { providerId: userObjectId } },
                {
                    $group: {
                        _id: "$providerId",
                        totalListings: { $sum: 1 },
                        avgListingRating: { $avg: "$ratings.average" }
                    }
                }
            ]);

            const bookingStats = await Booking.aggregate([
                { $match: { providerId: userObjectId } },
                {
                    $facet: {
                        totalEarnings: [
                            { $match: { status: "COMPLETED" } },
                            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                        ],
                        pendingRequests: [
                            { $match: { status: "REQUESTED" } },
                            { $count: "count" }
                        ],
                        activeBookings: [
                            { $match: { status: { $in: ["ACCEPTED", "IN_PROGRESS"] } } },
                            { $count: "count" }
                        ],
                        completedBookings: [
                            { $match: { status: "COMPLETED" } },
                            { $count: "count" }
                        ]
                    }
                }
            ]);

            const earnings = bookingStats[0]?.totalEarnings[0]?.total || 0;
            const pending = bookingStats[0]?.pendingRequests[0]?.count || 0;
            const active = bookingStats[0]?.activeBookings[0]?.count || 0;
            const completed = bookingStats[0]?.completedBookings[0]?.count || 0;
            const totalListings = listingStats[0]?.totalListings || 0;
            const overallRating = listingStats[0]?.avgListingRating 
                ? Math.round(listingStats[0].avgListingRating * 10) / 10 
                : 0;

            return res.status(200).json({
                success: true,
                role: "PROVIDER",
                user: {
                    name: user.name,
                    mobile: user.mobile
                },
                metrics: {
                    totalEarnings: earnings,
                    totalListings,
                    overallRating,
                    pendingRequests: pending,
                    activeBookings: active,
                    completedBookings: completed
                }
            });
        } else {
            // If user is a FARMER / RENTER
            const renterStats = await Booking.aggregate([
                { $match: { renterId: userObjectId } },
                {
                    $facet: {
                        totalSpent: [
                            { $match: { status: "COMPLETED" } },
                            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                        ],
                        activeRentals: [
                            { $match: { status: { $in: ["ACCEPTED", "IN_PROGRESS"] } } },
                            { $count: "count" }
                        ],
                        totalBookings: [
                            { $count: "count" }
                        ]
                    }
                }
            ]);

            const totalSpent = renterStats[0]?.totalSpent[0]?.total || 0;
            const activeRentals = renterStats[0]?.activeRentals[0]?.count || 0;
            const totalBookings = renterStats[0]?.totalBookings[0]?.count || 0;

            return res.status(200).json({
                success: true,
                role: user.role,
                user: {
                    name: user.name,
                    mobile: user.mobile
                },
                metrics: {
                    totalSpent,
                    activeRentals,
                    totalBookings
                }
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard metrics.",
            error: err.message
        });
    }
};

// Export both functions as an object
module.exports = {
    register,
    getDashboardMetrics
};