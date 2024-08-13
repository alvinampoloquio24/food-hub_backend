import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";

import Article from "../models/article";

const createArticle = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "article",
    });

    // Create poster with image URL from Cloudinary
    const article = await Article.create({
      ...req.body,
      img: result.secure_url, // Save the URL in the database
    });

    if (!article) {
      return res.status(400).json({ message: "Poster creation failed" });
    }

    return res.status(201).json(article);
  } catch (error) {
    console.error("Error creating poster:", error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" }); // Respond with a 500 status code
  }
};
const getArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.find();

    return res.status(200).json(article);
  } catch (error) {
    res.send(error);
  }
};

export { createArticle, getArticle };
