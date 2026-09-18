const notification=require("../models/Notification")

const getMyNotifications=async(req,res)=>{
    try{
        const notifications=await Notification.find({recipientId:req.user.id}).sort({createdAt:-1})
        .populate("bookingId","status serviceId")
        .sort({createdAt:-1})
        .limit(30)

        const unreadCount=await Notification.countDocuments({
            recipientId:req.user.id,
            isRead:false
        })

        return res.status(200).json({
            success:true,
            message:"Notifications fetched successfully",
            data:{
                notifications,
                unreadCount
            }
        })
       
    }
     catch(err){
            return res.status(500).json({
                success:false,
                message:"Internal server error",
                error:err.message
            })
        }
    }
// PATCH /api/notifications/:id/read - Mark one notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Marked as read",
      data: notification
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

// PATCH /api/notifications/read-all - Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};