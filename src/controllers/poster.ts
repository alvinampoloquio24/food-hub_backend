import { Request, Response } from "express";
import Poster from "../models/poster"; // Adjust the import path as needed
import cloudinary from "../config/cloudinary";

const createPoster = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "posters",
    });

    console.log(result);
    // Create poster with image URL from Cloudinary
    const poster = await Poster.create({
      ...req.body,
      img: result.secure_url, // Save the URL in the database
    });

    if (!poster) {
      return res.status(400).json({ message: "Poster creation failed" });
    }

    return res.status(201).json(poster);
  } catch (error) {
    console.error("Error creating poster:", error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" }); // Respond with a 500 status code
  }
};

const getPoster = async (req: Request, res: Response) => {
  try {
    const posters = await Poster.find();
    return res.status(200).json(posters);
  } catch (error) {}
};

export { createPoster, getPoster };
