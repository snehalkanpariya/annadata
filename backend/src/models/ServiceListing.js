const mongoose = require("mongoose");

const serviceListingSchema = new mongoose.Schema(
    {
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Provider ID is required"]
        },
        title: {
            type: String,
            
            required: [true, "Equipment/Service title is required"],
            trim: true
        },
        category: {
            type: String,
            enum: ["TRACTOR", "HARVESTER", "IRRIGATION PUMP", "SPRAYER", "THRESHER", "OTHER"],
            required: [true, "Category is required"]
        },
        description: {
            type: String,
            trim: true
        },
        images: [
            {
                type: String
            }
        ],
        pricing: {
            rate: {
                type: Number,
                required: [true, "Rental rate is required"],
                min: [0, "Rate cannot be negative"]
            },
            rateType: {
                type: String,
                enum: ["HOURLY", "PER_ACRE", "FIXED"],
                required: [true, "Rate type is required"]
            }
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number], // Stored as [longitude, latitude]
                required: [true, "Coordinates [longitude, latitude] are required"]
            }
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        specifications: {
            horsePower: { type: Number },
            fuelType: { type: String },
            modelYear: { type: Number }
        },
        ratings:{
           average:{ type:Number,default:0,min:0,max:5},
           count:{ type:Number,default:0 }

        }
    },
    { timestamps: true }
);

// 2dsphere index for radius / nearby search
serviceListingSchema.index({ location: "2dsphere" });

const ServiceListing = mongoose.model("ServiceListing", serviceListingSchema);

module.exports = ServiceListing;