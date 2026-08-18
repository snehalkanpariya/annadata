const express=require("express")
const router=express.Router()
const register=require("../controller/userController")
const { login }=require("../controller/authController")
const { verifyToken }=require("../middlewares/authMiddleware")

router.post("/login",login)

router.get("/me",verifyToken,(req,res)=>{
    return res.status(200).json({
        success:true,
        user:req.user
    })
})

module.exports=router