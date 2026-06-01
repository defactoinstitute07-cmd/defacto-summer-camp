const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/gallery.controller");
const { protect } = require("../middleware/auth");
const { galleryUpload } = require("../middleware/upload");

// Public
router.get("/", ctrl.getAllImages);
router.get("/category/:category", ctrl.getByCategory);

// Protected — single image upload
router.post("/", protect, galleryUpload.single("image"), ctrl.uploadImage);

// Protected — multiple images in one request (up to 20)
router.post("/bulk", protect, galleryUpload.array("images", 20), ctrl.bulkUpload);

router.delete("/:id", protect, ctrl.deleteImage);

module.exports = router;
