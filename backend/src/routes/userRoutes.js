const mongoose=require("mongoose")
const express=require("express")
const router=express.Router()

const register=require("../controller/userController")
console.log("Run correctly",register)
router.post("/register",register)

module.exports=router