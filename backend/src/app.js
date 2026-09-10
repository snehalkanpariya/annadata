const express=require("express")
const userRoutes=require("./routes/userRoutes")
const authRoutes=require("./routes/authRoutes")
const serviceRoutes=require("./routes/serviceRoutes")
const bookingRoutes=require("./routes/bookingRoutes")
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/api",userRoutes)
app.use("/api",serviceRoutes)
app.use("/api",authRoutes)
app.use("/api/booking",bookingRoutes)

app.use((req,res,next)=>{
    return res.status(400).json({
        success:false,
        message:`Route not found ${req.method} ${req.originalUrl}`
    })
})
module.exports=app