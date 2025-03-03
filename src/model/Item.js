const mongoose = require("mongoose");
const User = require("./User");

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["lost", "found", "claimed"],
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'User'
    },
    currentHolder: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'User'
    },
    time : {
        type: Date,
        required: true,
        default: Date.now
    }, 
    images: [{
        public_id: {
          type: String,
          required: true
        },
        url: {
          type: String,
          required: true
        }
      }],
}, {timestamps: true});


module.exports = mongoose.model("Item", itemSchema);