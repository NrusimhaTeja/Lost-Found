const express = require("express");
const router = express.Router();
const userAuth = require("../utils/userAuth");
const User = require("../model/User");
const Item = require("../model/Item")

router.post("/report/item/:status", userAuth, async (req, res) => {
    try {
        const status = req.params.status;
        const itemDetails = req.body;
        const {_id} = req.user;
        
        if (!["lost", "found"].includes(status)) {
            return res.status(400).json({"message" : "Bad request"});
        }
        const item = Item({
            ...itemDetails, 
            status,
            currentHolder: _id
        })
        await item.save();
        res.json({"message": "Item reported successfully"});
    } catch(err) {
        res.json({"message": err.message});
    }
})


router.get("/item/:status", userAuth, async (req, res) => {
    try {
        const status = req.params.status;
        if (!["lost", "found", "claimed"].includes(status)) {
            throw new Error("invalid request");
        }
        const itemList = await Item.find({status});
        if (!itemList) {
            return res.json({"message": "No item found"});
        }
        res.json(itemList);
    } catch(err) {  
        res.json({"error": err.message});
    }
})





module.exports = router;