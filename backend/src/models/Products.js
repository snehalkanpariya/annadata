const mongoose=require("mongoose")

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    category:{
        type:String,
        enum:['PESTICIDE','INSECTISIDE','BIO_BOOTER','FERTILIZER','SEEDS'],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    stockQuantity:{
        type:Number,
        required:true,
        min:0
    },
    unit:{
        type:String,
        required:true
    },
    suitableCrops:{
        type:String
    },
    images:[{
        type:String
    }],
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})


const productModel=mongoose.model('Product',productSchema)

module.exports=productModel