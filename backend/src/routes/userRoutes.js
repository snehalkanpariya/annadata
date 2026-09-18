const mongoose=require("mongoose")
const express=require("express")
const router=express.Router()

const {register,getDashboardMetrics}=require("../controller/userController")
const {verifyToken}=require("../middlewares/authMiddleware")
console.log("Run correctly",register)
router.post("/register",register)
router.get("/dashboard",verifyToken,getDashboardMetrics)

module.exports=router