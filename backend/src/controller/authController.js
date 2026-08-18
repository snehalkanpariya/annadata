const userModel=require("../models/User")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")

const generateTokens=(userId,role)=>{
    const accessToken=jwt.sign(
        {id:userId,role},
        process.env.JWT_SECRET || "access_secret_key",
        {
            expiresIn:"15m"
        }
    )


    const refreshToken=jwt.sign(
        {id:userId},
        process.env.REFRESH_TOKEN_SECRET || "refresh_secret_key",
        {
            expiresIn:"7d"
        }
    )
    return { accessToken,refreshToken}
}

const login=async(req,res,next)=>{
    try{
        const {mobile,password}=req.body
        if(!mobile || !password){
            return res.status(201).json({
                message:"Provide all values to login"
            })
        }
        const user=await userModel.findOne({mobile})
        if(!user){
            return res.status(400).json({
                message:"Invalid user or password"
            })
        }
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({
                message:"Invalid user or password"
            })
        }
        const { accessToken,refreshToken}=generateTokens(user._id,user.role)
        user.refreshToken=refreshToken
        await user.save()

        res.cookie("refreshtoken",refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })
        return res.status(200).json({
            success:true,
            message:"Login successful",
            accessToken,
            user:{
                id:user._id,
                name:user.name,
                mobile:user.mobile,
                role:user.role,
                location:user.location
            }
        })
    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error:err.message
        })
    }
}


module.exports={ login} 