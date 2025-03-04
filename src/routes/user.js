const express = require("express");
const router = express.Router();
const userAuth = require("../utils/userAuth");
const User = require("../model/User");
const Item = require("../model/Item");
const multer = require("multer");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const { upload } = require("../config/cloudinary");

// POST endpoint for reporting lost/found items
router.post(
  "/report/item/:status",
  userAuth,
  upload.array("images", 5), // Handle up to 5 images
  async (req, res) => {
    try {
      const status = req.params.status;
      const { title, description, location, date, time } = req.body;
      const { _id } = req.user;

      console.log("Request body:", req.body);
      console.log("Status:", status);
      console.log("Files received:", req.files ? req.files.length : 0);

      // Validate status
      if (!["lost", "found"].includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status. Must be 'lost' or 'found'" });
      }

      // Process uploaded images
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            console.log(
              `Processing file: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`
            );
            const result = await uploadToCloudinary(file);
            console.log("Cloudinary upload result:", result.public_id);

            imageUrls.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          } catch (error) {
            console.error("Error uploading image:", error);
            // Continue with other images if one fails
          }
        }
      }

      console.log("Processed image URLs:", imageUrls);

      // Create timestamp from date and time
      let timestamp;
      if (date && time) {
        timestamp = new Date(`${date}T${time}`);
      } else {
        timestamp = new Date();
      }

      // Create the item object based on status
      let item;
      if (status === "found") {
        item = new Item({
          title,
          description,
          location,
          timestamp,
          status,
          currentHolder: _id,
          images: imageUrls,
        });
      } else {
        item = new Item({
          title,
          description,
          location,
          timestamp,
          status,
          owner: _id,
          images: imageUrls,
        });
      }

      // Save the item to the database
      await item.save();

      res.status(201).json({
        message: "Item reported successfully",
        item: {
          id: item._id,
          title: item.title,
          status: item.status,
          images: imageUrls,
        },
      });
    } catch (err) {
      console.error("Error reporting item:", err.message);
      console.error(err.stack);
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/item/:status", userAuth, async (req, res) => {
  try {
    const status = req.params.status;
    const { _id } = req.user;
    if (!["lost", "found", "claimed"].includes(status)) {
      throw new Error("invalid request");
    }
    const itemList = await Item.find({ status })
      .populate("currentHolder")
      .populate("owner");
    if (!itemList) {
      return res.json({ message: "No item found" });
    }
    console.log(itemList);
    const data = itemList.filter(
      (item) =>
        (item.status !== "lost" && !item.currentHolder._id.equals(_id)) ||
        (item.status === "lost" && !item.owner._id.equals(_id))
    );
    console.log(_id);
    console.log(data);
    res.json(data);
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;
