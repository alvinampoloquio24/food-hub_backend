import express from "express";
import createPoster from "../controllers/poster"; // Adjust the path to where your createPoster function is defined
import upload from "../middleware/upload";
const router = express.Router();

// Define the POST route for creating a new poster
router.post("/addPoster", upload.single("image"), createPoster);

export default router;
