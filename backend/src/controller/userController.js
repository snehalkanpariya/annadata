const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userModel = require("../models/User");

const register = async (req, res) => {
    try {
        const { name, mobile, password, role, longitude, latitude, address } = req.body;
        
        if (!name || !mobile || !password || longitude == undefined || latitude == undefined) {
            return res.status(400).json({
                success: false,
                message: 'Fill out required details'
            });
        }
        
        const alreadyExists = await userModel.findOne({ mobile });
        if (alreadyExists) {
            // Note: 409 Conflict or 400 Bad Request is standard for existing users, 404 means 'Not Found'
            return res.status(400).json({ 
                success: false,
                message: 'User already exists with this phone number'
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            mobile,
            password: hashedPassword,
            role: role || "FARMER",
            location: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)], // 🎯 FIXED: Changed coorinates -> coordinates
                address: address || ""
            }
        });
        
        await newUser.save();
        
        return res.status(200).json({
            success: true,
            message: 'Details are saved successfully',
            data: {
                id: newUser._id,
                name: newUser.name,
                mobile: newUser.mobile,
                role: newUser.role
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};

module.exports = register;
