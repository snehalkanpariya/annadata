const userModel=require("../models/User")
const serviceModel=require("../models/ServiceListing")

const createListing=async(req,res)=>{
    try{
        const { title,category,description,pricing,location,specifications }=req.body
        if(!title || !category || !pricing || !location){
            return res.status(400).json({
                message:"Enter required values"
            })
        }
        if(!pricing.rate || !pricing.rateType){
            return res.status(400).json({
                message:"Enter pricing rate details"
            })
        }
        if(!location.coordinates || location.coordinates.length !==2){
            return res.status(400).json({
                message:"Valid coordites [longitude,latitude] are required"
            })
        }
        const user=req.user.id
        const savedList=await serviceModel.create({
            providerId:req.user.id,
            title,
            category,
            description,
            pricing,
            location,
            specifications
        })
        
        return res.status(201).json({
            message:"New listing is created",
            data:savedList
        })
    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error:err.message
        })
    }
}
const getNearByService=async(req,res)=>{
    try{
        const { latitude,longitude,radius,category}=req.query
        if(!latitude || !longitude){
            return res.status(400).json({
                message:"Provide [latitude,longitude] values"
            })
        }
        const maxDistance=(Number(radius) || 25)*1000
        const query={
            location:{
                $near:{
                    $geometry:{
                        type:"Point",
                        coordinates:[parseFloat(longitude),parseFloat(latitude)]
                    },
                    $maxDistance:maxDistance

                }
            },
            isAvailable:true
        }
        if(category){
            query.category=category
        }
        const listing=await serviceModel.find(query).populate("providerId","name phone email")
        return res.status(200).json({
            message:"Service is found",
            count:listing.length,
            data:listing
        })
    }
    
    catch(err){
        return res.status(500).json({
        message:"Internal server error",
        error:err.message
    })
}
}
const getAllService=async(req,res)=>{
    try{
        const {category,page,limit}=req.query
        const filter={ isAvailable:true}
        if(category){
            filter.category=category
        }
        const skip=(Number(page)-1)*Number(limit)
        const services=await serviceModel.find(filter)
        .populate("providerId","name phone email")
        .skip(skip)
        .limit(Number(limit))
        .sort({createdAt : -1})
        
        const total=await serviceModel.countDocuments(filter)
        return res.status(200).json({
            message:"All services are fetched",
            data:services,
            totalPages:Math.ceil(total/limit)
        })
    }
    catch(err){
        return res.status(500).json({
        message:"Internal server error",
        error:err.message
    })
}
}
const getServiceById=async(req,res)=>{
    try{
        const id=req.params.id
        const service=await serviceModel.findById(id).populate("providerId","name mobile email")
        if(!service){
            return res.status(404).json({
                message:"No service is found with this id"
            })
        }
        return res.status(200).json({
            message:"Service is found",
            data:service
        })
    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error:err.message
        })
    }
}
const updateListing=async(req,res)=>{
    try{
        const serviceId=req.params.id
        const findService=await serviceModel.findById(serviceId)
        if(!findService){
            return res.status(404).json({
                message:"Serivce is not found with this id"
            })
        }
        if(findService.providerId.toString()!==req.user.id){
            return res.status(403).json({
                message:"Unauthorized: You can only update your listings"
            })
        }
        const updatedService=await serviceModel.findByIdAndUpdate(serviceId,req.body,{new:true,runValidators:true})
        return res.status(200).json({
            message:'Service is updated',
            data:updatedService
        })

    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error:err.message
        })
    }
}
const deleteListing=async(req,res)=>{
    try{
        const id=req.params.id
        const findListing=await serviceModel.findById(id)
        if(!findListing){
            return res.status(404).json({
                message:"Service is not found"
            })
        }
        if(findListing.providerId.toString() !== req.user.id){
            return res.status(403).json({
                message:"Unauthorized:you cannot delete the service rather than yours"
            })
        }
        const deletedSerivce=await serviceModel.findByIdAndDelete(id)
        return res.status(200).json({
            message:"Service is deleted",
            data:deletedSerivce
        })

    }catch(err){
         return res.status(500).json({
            message:"Internal server error",
            error:err.message
        })
    }
}
module.exports={createListing,getNearByService,getAllService,getServiceById,updateListing,deleteListing}