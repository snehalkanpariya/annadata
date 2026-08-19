const express=require("express")
const router=express.Router()
const { createListing,getNearByService,getAllService,getServiceById,updateListing,deleteListing}=require("../controller/serviceController")
const { verifyToken }=require("../middlewares/authMiddleware")

router.post("/createservice",verifyToken,createListing)
router.get("/nearby", getNearByService);
router.get("/", getAllService);
router.get("/:id", getServiceById);
router.put("/services/:id",verifyToken,updateListing)
router.delete("/services/:id",verifyToken,deleteListing)
module.exports=router