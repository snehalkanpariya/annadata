const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceListing",
            required: true
        },
        renterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        scheduledDate: {
            type: Date,
            required: true
        },
        estimatedUnits: {
            type: Number,
            required: true,
            min: 1
        },
        totalAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["REQUESTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
            default: "REQUESTED"
        },
        completionOtp: {
            type: String,
            select: false
        },
        isPaid: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const BookingModel = mongoose.model("Booking", bookingSchema);

module.exports = BookingModel;