const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ServiceListing = require('../models/ServiceListing');

const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comments } = req.body;

        if (!bookingId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Booking Id and Rating are required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Booking Id'
            });
        }

        // 1. Fetch the booking record from the database
        const bookingData = await Booking.findById(bookingId);
        if (!bookingData) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // 2. Validate renterId presence on the database document
        if (!bookingData.renterId) {
            return res.status(500).json({
                success: false,
                message: 'Corrupted booking record: renterId is missing from this booking.'
            });
        }

        // 3. Extract user ID safely
        const currentUserId = req.user?.id || req.user?._id;
        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user authentication context.'
            });
        }

        // 4. Authorization check
        if (bookingData.renterId.toString() !== currentUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to review this booking'
            });
        }

        // 5. Status check
        if (bookingData.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: `Cannot review a booking that is not completed. Current status: ${bookingData.status}`
            });
        }

        // 6. Check for duplicate review
        const existingReview = await Review.findOne({ bookingId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this booking'
            });
        }

        // 7. Create review
        const newReview = await Review.create({
            bookingId,
            serviceId: bookingData.serviceId,
            renterId: currentUserId,
            rating: Number(rating),
            comment: comments || ''
        });

        // 8. Recalculate average rating
        const stats = await Review.aggregate([
            { $match: { serviceId: bookingData.serviceId } },
            {
                $group: {
                    _id: '$serviceId',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            const avg = Math.round(stats[0].averageRating * 10) / 10;
            const count = stats[0].reviewCount;

            await ServiceListing.findByIdAndUpdate(bookingData.serviceId, {
                'ratings.average': avg,
                'ratings.count': count
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: newReview
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            more: err.message
        });
    }
};

const getServiceReviews = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service id'
            });
        }

        const reviews = await Review.find({ serviceId })
            .populate('renterId', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Reviews fetched successfully',
            data: reviews
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            more: err.message
        });
    }
};

module.exports = { createReview, getServiceReviews };
