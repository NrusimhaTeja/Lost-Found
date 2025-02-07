const mongoose = require("mongoose");
const User = require("./User");
const Item = require("./Item")


const itemRequestSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Item'
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User'
    }, 
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("ItemRequest", itemRequestSchema);