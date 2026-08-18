const mongoose=require("mongoose")

const serviceListingSchema=new mongoose.Schema({
    providerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    title:{
        type:String,
        required:[true,'Equipment/Service title is required'],
        trim:true
    },
    category:{
        type:String,
        enum:['TRACTOR','HARVESTER','IRRIGATION PUMP','SPRAYER','THRESHER','OTHER'],
        required:true
    },
    description:{
        type:String,
        trim:true
    },
    images:[{
        type:String
    }],
    pricing:{
        retetype:{
            type:String,
            enum:['HOURLY','PER_ACRE','FIXED'],
            required:true
        }
    },
    rate:{
        type:Number,
        required:true,
        min:0
    },
    location:{
        type:{
        type:String,
        enum:['Point'],
        default:'Point'
    },
    coordinates:{
        type:[Number],
        required:true
    }
    },
    isAvailable:{
        type:Boolean,
        default:true
    },

},{timestamps:true})

serviceListingSchema.index({location:'2dsphere'})


const serviceListingModel=mongoose.model('Service-Listing',serviceListingSchema)

module.exports=serviceListingModel