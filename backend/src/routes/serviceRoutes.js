const express=require("express")
const router=express.Router()
const { createListing,getNearByService,getAllService,getServiceById,updateListing,deleteListing}=require("../controller/serviceController")
const { verifyToken }=require("../middlewares/authMiddleware")

router.post("/services/createservice",verifyToken,createListing)
router.get("/services/nearby", getNearByService);
router.get("/services/", getAllService);
router.get("/services/:id", getServiceById);
router.put("/services/:id",verifyToken,updateListing)
router.delete("/services/:id",verifyToken,deleteListing)
module.exports=router