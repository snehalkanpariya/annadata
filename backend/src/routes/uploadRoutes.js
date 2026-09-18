const express=require("express");
const router=express.Router();
const {upload}=require("../config/cloudinary")
const {verifyToken}=require("../middlewares/authMiddleware");


router.post("/single",verifyToken,upload.single("image"),(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"No file uploaded"
            });
        }
        return res.status(200).json({
            success:true,
            message:"File uploaded successfully",
            file:req.file
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:err.message
        })
    }
})
router.post("/multiple",verifyToken,upload.array("images",5),(req,res)=>{
    try{
        if(!req.files || req.files.length===0){
            return res.status(400).json({
                success:false,
                message:"No files uploaded"
            })
        }
        const urls=req.files.map(file=>file.path)

        return res.status(200).json({
            success:true,
            message:"Files uploaded successfully",
            
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:err.message
        })
    }
})

module.exports=router;