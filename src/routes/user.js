const express = require("express");
const router = express.Router();
const userAuth = require("../utils/userAuth");
const User = require("../model/User");
const Item = require("../model/Item")

router.get("/item/:itemId", userAuth, async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId).populate("currentHolder", "firstName lastName");

        if (!item) {
            return res.status(404).json({"message" : "Item not found"});
        }
        res.json(item);
    } catch(err) {
        res.json({"message": err.message})
    }
    

})

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

router.patch("/item/:itemId/claim", userAuth, async (req, res) => {
    res.json({"message": "under progress"});
})

router.get("/item", userAuth, async (req, res) => {
    try {
        const itemList = await Item.find({currentHolder: req.user._id});
        if (!itemList) {
            return res.json({"message": "No item found"});
        }
        res.json(itemList);
    } catch(err) {  
        res.json({"error": err.message});
    }
})

module.exports = router;