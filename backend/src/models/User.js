const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        trim:true
    },
    mobile:{
        type:String,
        required:[true,'Mobile number is required'],
        unique:true,
        trim:true
    },
    password:{
        type:String,
        require:[true,'Password is required']
    },
    role:{
        type:String,
        enum:['FARMER','STORE_ADMIN'],
        default:'FARMER'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'], // Has to be 'Point' for GeoJSON
            default: 'Point'
        },
        coordinates: {
            type: [Number], // Array of numbers: [longitude, latitude]
            required: true
        },
        address: {
            type: String
        }
    },
    address:{
        type:String,
        trim:true
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})

userSchema.index({
    location:'2dsphere'
})
const userModel=mongoose.model('User',userSchema)

module.exports=userModel