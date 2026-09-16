const express=require('express')
const router=express.Router()
const {createReview,getServiceReviews}=require('../controller/reviewController')
const {verifyToken}=require('../middlewares/authMiddleware')

router.post('/create-review',verifyToken,createReview)
router.get('/service-reviews/:serviceId',getServiceReviews)

module.exports=router