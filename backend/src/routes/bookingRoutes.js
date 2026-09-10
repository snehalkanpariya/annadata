const express=require("express")
const router=express.Router()
const {createBooking,getMyBookings,getProviderRequests,updateBookingStatus}=require("../controller/bookingController")
const {verifyToken}=require("../middlewares/authMiddleware")

router.post("/createbooking",verifyToken,createBooking)
router.get("/my-bookings", verifyToken, getMyBookings);
router.get("/provider-requests", verifyToken, getProviderRequests);
router.patch("/:id/status",verifyToken,updateBookingStatus)
module.exports=router