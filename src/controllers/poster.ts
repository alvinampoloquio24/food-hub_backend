import { Request, Response } from "express";
import Poster from "../models/poster"; // Adjust the import path as needed
import cloudinary from "../config/cloudinary";
import PosterService from "../services.ts/poster";
import Article from "../models/article";
import Recipe from "../models/recipe";

const createPoster = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      console.log("no file");
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "posters",
    });
    // Create poster with image URL from Cloudinary
    const poster = await Poster.create({
      ...req.body,
      img: result.secure_url, // Save the URL in the database
    });
    if (!poster) {
      return res.status(400).json({ message: "Poster creation failed" });
    }
    let ingredients = req.body.ingredients;
    let directions = req.body.directions;
    if (typeof ingredients === "string") {
      ingredients = JSON.parse(ingredients);
    }
    if (typeof directions === "string") {
      directions = JSON.parse(directions);
    }
    const recipe = await Recipe.create({
      dishId: poster._id,
      ingredients,
      directions, // Assuming req.body.ingredients is an array of ingredients
    });
    return res.status(201).json({ poster, recipe });
  } catch (error) {
    console.error("Error creating poster:", error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" }); // Respond with a 500 status code
  }
};

const getPoster = async (req: Request, res: Response) => {
  try {
    let result = await Poster.aggregate([
      {
        $lookup: {
          from: "recipes",
          localField: "_id",
          foreignField: "dishId",
          as: "recipesArray",
        },
      },
      {
        $addFields: {
          recipe: { $arrayElemAt: ["$recipesArray", 0] },
        },
      },
      {
        $project: {
          recipesArray: 0,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json(result);
  } catch (error) {
    res.send(error);
  }
};
const searchPoster = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const poster = await PosterService.findPoster(id);
    if (!poster) {
      return res.status(400).json({ message: "No poster exist in this id. " });
    }
    return res.status(200).json(poster);
  } catch (error) {
    res.send(error);
  }
};
const searchPosterWithName = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing name parameter" });
    }

    const result = await Poster.aggregate([
      {
        $match: {
          name: { $regex: name, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "recipes",
          localField: "_id",
          foreignField: "dishId",
          as: "recipesArray",
        },
      },
      {
        $addFields: {
          recipe: { $arrayElemAt: ["$recipesArray", 0] },
        },
      },
      {
        $project: {
          recipesArray: 0,
        },
      },
    ]);

    // Send the response after the delay
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error searching posters:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
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

export {
  createPoster,
  getPoster,
  searchPoster,
  searchPosterWithName,
  createArticle,
  getArticle,
};
