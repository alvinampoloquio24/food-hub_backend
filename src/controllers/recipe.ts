import { NextFunction, Request, Response } from "express";
import Recipe from "../models/recipe"; // Adjust the import path as needed
import cloudinary from "../config/cloudinary";
import mongoose from "mongoose";
import User from "../models/user";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

const postRecipe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "posters",
    });

    let { ingredients, directions, ...otherFields } = req.body;

    // Parse ingredients if it's a string
    if (typeof ingredients === "string") {
      ingredients = JSON.parse(ingredients);
    }

    // Parse directions if it's a string
    if (typeof directions === "string") {
      directions = JSON.parse(directions);
    }

    // Ensure directions is an array of objects
    if (!Array.isArray(directions)) {
      return res.status(400).json({ message: "Directions must be an array" });
    }

    const recipe = await Recipe.create({
      ...otherFields,
      ingredients,
      directions,
      img: result.secure_url,
      userId: req.user?.userId,
    });

    return res.status(201).json(recipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const updateRecipe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const recipeData = req.body;

    // Check if a new image was uploaded
    if (req.file) {
      const imageUrl = await cloudinary.uploader.upload(req.file.path); // Upload the image and get the URL
      recipeData.img = imageUrl.secure_url; // Update the image field with the new URL
    }

    // Update recipe in the database (ensure to exclude updating image if not provided)
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, recipeData, {
      new: true,
    });

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    return res.status(200).json(updatedRecipe);
  } catch (error) {
    next(error);
  }
};
const getRecipes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "name profile -_id",
        model: "User",
      })
      .lean()
      .exec();
    const modifiedRecipes = recipes.map((recipe) => ({
      ...recipe,
      user: recipe.userId, // Assign userId to user
    }));

    return res.status(200).json(modifiedRecipes);
  } catch (error) {
    return next(error);
  }
};
const searchRecipeByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing name parameter" });
    }

    // Create a case-insensitive regex pattern
    const nameRegex = new RegExp(name, "i");

    // Use the regex in the find query
    const recipes = await Recipe.find({ name: { $regex: nameRegex } })
      .populate({
        path: "userId",
        select: "name profile -_id",
        model: "User",
      })
      .lean()
      .exec();
    const modifiedRecipes = recipes.map((recipe) => ({
      ...recipe,
      user: recipe.userId, // Assign userId to user
    }));

    return res.status(200).json(modifiedRecipes);
  } catch (error) {
    console.error("Error searching recipes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const searchRecipeId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(400).json({ message: "No recipe exist in this id. " });
    }
    return res.status(200).json(recipe);
  } catch (error) {
    res.send(error);
  }
};
const getSelfRecipes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipes = await Recipe.find({ userId: req.user?.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "name profile -_id",
        model: "User",
      })
      .lean()
      .exec();
    const modifiedRecipes = recipes.map((recipe) => ({
      ...recipe,
      user: recipe.userId, // Assign userId to user
    }));

    return res.status(200).json(modifiedRecipes);
  } catch (error) {
    return next(error);
  }
};
const deleteRecipe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      userId: req.user?.userId,
      _id: req.params.id,
    });

    if (!recipe) {
      return res.status(400).json({ messsage: "No recipe in Id provided!" });
    }
    return res.status(200).json({ message: "Delete Successfully. " });
  } catch (error) {
    return next(error);
  }
};

const RecipeController = {
  updateRecipe,
  getRecipes,
  searchRecipeByName,
  searchRecipeId,
  postRecipe,
  getSelfRecipes,
  deleteRecipe,
};

export default RecipeController;
