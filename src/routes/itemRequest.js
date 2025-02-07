const express = require("express");
const router = express.Router();
const userAuth = require("../utils/userAuth");
const User = require("../model/User");
const Item = require("../model/Item");
const ItemRequest = require("../model/ItemRequest");

router.post("/request/send/:itemId", userAuth, async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const itemDetails = await Item.findById(itemId);
        if (!itemDetails) {
            return res.status(404).json({"message": "item not found"});
        }
        if (itemDetails.status === "lost" || itemDetails.currentHolder === req.user._id) {
            return res.status(400).json({"error": "bad request"});
        }
        const AlreadyRequested = await ItemRequest.findOne({itemId, requestedBy: req.user._id});
        if (AlreadyRequested) {
            return res.json({"message": "request already exists"});
        }
        const request = ItemRequest({
            itemId,
            requestedBy: req.user._id
        });
        await request.save();
        res.json({"message": "request sent successfully"});
    } catch(err) {
        console.log(err.message);
        res.json({"error": err.message});
    }
})

router.get("/request/send", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const itemList = await ItemRequest.find({requestedBy: userId})
                                            .populate({
                                                path: "itemId",
                                                populate: {path: "currentHolder"}
                                            })
        const data = itemList.map((item) => {
            return {status: item.status, itemDetails: item.itemId};
        })
        res.json(data);
    } catch(err) {
        res.json({"error": err.message});
    }
})

router.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const status = req.params.status;

        if (!["rejected", "accepted"].includes(status)) {
            return res.json({"message": "Invalid operation"});
        }
        const request = await ItemRequest.findById(requestId).populate({
            path: "itemId",
            populate: {path: "currentHolder"}
        });
        if (!request || request.status !== "pending" || !request.itemId.currentHolder._id.equals(req.user._id)) {
            return res.json({"message": "Invalid operation"});
        }
        if (status === "rejected") {
            request.status = "rejected";
            await request.save();
            return res.json({"message": "request rejected successfully"});
        } else {
            const requestUserId = request.requestedBy;
            const item = await Item.findById(request.itemId._id);
            request.status = "accepted";
            console.log(item);
            console.log(requestUserId);
            item.currentHolder = requestUserId;
            await request.save();
            await item.save();
            return res.json({"message": "request accepted successfully"});
        }
    } catch(err) {
        res.json({"error": err.message})
    }

})




module.exports = router;