const express = require("express");
const router = express.Router();
const userAuth = require("../utils/userAuth");
const User = require("../model/User");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");  


router.get("/profile", userAuth, (req, res) => {
    res.json(req.user);
})

router.post("/signup", async (req, res) => {
    try {
        const userDetails = req.body;
        const hashedPassword = await bcrypt.hash(userDetails.password, 10);
        const user = User({
            ...userDetails,
            password: hashedPassword
        })
        await user.save();
        res.json({"message" : "user created successfully"});
    } catch(err) {
        res.json({"message" : err.message});
    }
})

router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.json({"message" : "Invalid Credentials"});
        }
        const isValidUser = await bcrypt.compare(password, user.password);
        if (isValidUser) {
            const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY);
            res.cookie("token", token);
            res.json({"message" : "user logged in successfully"});
        } else {
            return res.json({"message" : "Invalid Credentials"});
        }
    } catch(err) {
        console.log("ERROR : " + err.message);
        res.json({"message" : err.message});
    }
})

router.post("/logout", (req, res) => {
    res.cookie("token", null, {maxAge: 0});
    res.json({"message" : "user logged out successfully"});
})

module.exports = router;