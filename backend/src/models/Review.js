const mongoose=require('mongoose');
const reviewSchema=new mongoose.Schema({
    bookingId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Booking',
        required:[true,'Booking Id is required'],
        unique:true
    },
    serviceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ServiceListing',
        required:[true,'Service Id is required'],
    },
    renterId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,'Renter id is required'],
    },
    rating:{
        type:Number,
        required:[true,'Rating is required'],
        min:[1,'Rating must be between 1 and 5'],
        max:[5,'Rating must be between 1 and 5']
    },
    comments:{
        type:String,
        trim:true,
        maxLength:[500,'Comments cannot exceed 500 characters'],
        default:''
    }
},
{
    timestamps:true
});

reviewSchema.index({serviceId:1,renterId:1},{unique:true});

module.exports=mongoose.model('Review',reviewSchema);