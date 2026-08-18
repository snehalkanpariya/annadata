const mongoose=required("mongoose")

const orderItemSchema=new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    priceAtPurchase:{
        type:Number,
        required:true
    }
})


const orderSchema=new mongoose.Schema({
    buyerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[orderItemSchema],
    totalAmount:{
        type:Number,
        required:true
    },
    shippingAddress:{
        street:String,
        city:String,
        pincode:String
    },
    paymentStatus:{
        type:String,
        enum:['PENDING',"PAID",'FAILED'],
        default:'PENDING'
    },
    orderStatus:{
        type:String,
        enum:['PLACED',"SHIPPED",'DELIVERED','CANCELLED'],
        default:'PLACED'
    }
},{timestamp:true})

const orderModel=mongoose.model('Order',orderSchema)