const express=require("express")
const userRoutes=require("./routes/userRoutes")
const authRoutes=require("./routes/authRoutes")
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/api",userRoutes)
app.use("/api",authRoutes)

app.use((req,res,next)=>{
    return res.status(400).json({
        success:false,
        message:`Route not found ${req.method} ${req.originalUrl}`
    })
})
module.exports=app