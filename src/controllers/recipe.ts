import { NextFunction, Request, Response } from "express";
import Recipe from "../models/recipe"; // Adjust the import path as needed
import cloudinary from "../config/cloudinary";
import Save from "../models/save";
import SaveModel from "../models/save";

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
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    // Fetch recipes with pagination and populate user details
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate({
        path: "userId",
        select: "name profile -_id",
        model: "User",
      })
      .lean();

    // Add isSaved flag to each recipe
    const modifiedRecipes = recipes.map((recipe) => ({
      ...recipe,
      user: recipe.userId, // Assign userId to user
    }));

    // Get total count of recipes for pagination
    const totalRecipes = await Recipe.countDocuments();
    const hasMore = pageNumber * limitNumber < totalRecipes;

    return res.status(200).json({
      items: modifiedRecipes,
      hasMore,
    });
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
    const searchRegex = new RegExp(name, "i");

    // Find recipes where the name or description matches the regex pattern
    const recipes = await Recipe.find({
      $or: [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ],
    })
      .populate({
        path: "userId",
        select: "name profile -_id",
        model: "User",
      })
      .lean()
      .exec();

    // Map over recipes to include user information directly
    const modifiedRecipes = recipes.map((recipe) => ({
      ...recipe,
      user: recipe.userId, // Assign populated user data to 'user'
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
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const recipes = await Recipe.find({ userId: req.user?.userId })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber) // Ensure the limit is applied
      .populate({
        path: "userId",
        select: "name profile -_id",
        model: "User",
      })
      .lean()
      .exec();

    const totalRecipes = await Recipe.countDocuments({
      userId: req.user?.userId,
    });
    const hasMore = pageNumber * limitNumber < totalRecipes;

    const modifiedRecipes = recipes.map((recipe) => ({
      ...recipe,
      user: recipe.userId, // Assign userId to user
    }));

    return res.status(200).json({
      recipes: modifiedRecipes,
      hasMore,
    });
  } catch (error) {
    return next(error);
  }
};
const savedRecipe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const recipeId = req.params.id;

    const isRecipeExist = await Recipe.findById(recipeId);

    if (!isRecipeExist) {
      return res.status(200).json({ message: "No  recipe in provided Id." });
    }
    // Find the Save document for the user or create a new one
    let saveDoc = await SaveModel.findOne({ userId });

    if (!saveDoc) {
      // If no document exists, create a new one with the recipe
      saveDoc = new SaveModel({
        userId,
        savedRecipes: [{ recipeId }],
      });
    } else {
      // If the document exists, add the recipeId to the savedRecipes array if it's not already there
      if (
        !saveDoc.savedRecipes.some(
          (item) => item.recipeId.toString() === recipeId
        )
      ) {
        saveDoc.savedRecipes.push({ recipeId });
      }
    }

    // Save the updated or new Save document
    await saveDoc.save();

    res.status(200).json({ message: "Recipe saved successfully." });
  } catch (error) {
    // console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while saving the recipe." });
  }
};
const getRecipesPages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    // Fetch recipes with pagination and populate user details
    const recipes = await Recipe.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate({
        path: "userId",
        select: "name profile -_id",
        model: "User",
      })
      .lean();

    // Fetch saved recipes for the current user
    const savedData = await Save.findOne({ userId: req.user?.userId }).lean();

    // Extract array of saved recipe IDs
    const savedRecipeIds = savedData
      ? savedData.savedRecipes.map((item) => item.recipeId.toString())
      : [];

    // Add isSaved flag to each recipe
    const modifiedRecipes = recipes.map((recipe) => ({
      ...recipe,
      user: recipe.userId, // Assign userId to user
      isSaved: savedRecipeIds.includes(recipe._id.toString()),
    }));

    // Get total count of recipes for pagination
    const totalRecipes = await Recipe.countDocuments();
    const hasMore = pageNumber * limitNumber < totalRecipes;

    return res.status(200).json({
      items: modifiedRecipes,
      hasMore,
    });
  } catch (error) {
    return next(error);
  }
};
const getTrendRecipes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch recipes with pagination and populate user details
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })

      .limit(3)
      .skip(2)
      .populate({
        path: "userId",
        select: "name profile -_id",
        model: "User",
      })
      .lean();

    // Fetch saved recipes for the current user
    const savedData = await Save.findOne({ userId: req.user?.userId }).lean();
    // Extract array of saved recipe IDs
    const savedRecipeIds = savedData
      ? savedData.savedRecipes.map((item) => item.recipeId.toString())
      : [];
    // Add isSaved flag to each recipe
    const modifiedRecipes = recipes.map((recipe) => ({
      ...recipe,
      user: recipe.userId, // Assign userId to user
      isSaved: savedRecipeIds.includes(recipe._id.toString()),
    }));

    return res.status(200).json({
      items: modifiedRecipes,
    });
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
const getSavedRecipes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    // Find the saved recipes for the user
    const savedRecipes = await SaveModel.findOne({ userId });

    // Get the list of recipe IDs
    const recipeIds = savedRecipes
      ? savedRecipes.savedRecipes.map((item) => item.recipeId.toString())
      : [];

    // Fetch the actual recipe documents based on the recipe IDs
    const recipes = await Recipe.find({
      _id: { $in: recipeIds },
    })
      .populate({
        path: "userId",
        select: "name profile -_id",
        model: "User",
      })
      .lean();
    const modifiedRecipes = recipes.map((recipe) => ({
      ...recipe,
      user: recipe.userId, // Assign userId to user
    }));
    const a = modifiedRecipes;
    // Return the recipes in the response
    return res.status(200).json(a);
  } catch (error) {
    return next(error);
  }
};
const deleteSavedRecipe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const recipeId = req.params.id;

    // Check if the recipe exists
    const isRecipeExist = await Recipe.findById(recipeId);

    if (!isRecipeExist) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    // Find the Save document for the user
    const saveDoc = await SaveModel.findOne({ userId });

    if (!saveDoc) {
      return res
        .status(404)
        .json({ message: "No saved recipes found for the user." });
    }

    // Find the index of the recipeId in the savedRecipes array
    const recipeIndex = saveDoc.savedRecipes.findIndex(
      (item) => item.recipeId.toString() === recipeId
    );

    if (recipeIndex === -1) {
      return res
        .status(404)
        .json({ message: "Recipe not found in saved recipes." });
    }

    // Remove the recipe from the savedRecipes array
    saveDoc.savedRecipes.splice(recipeIndex, 1);

    // Save the updated Save document
    await saveDoc.save();

    res
      .status(200)
      .json({ message: "Recipe removed from saved recipes successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while removing the saved recipe." });
  }
};

const RecipeController = {
  updateRecipe,
  getRecipesPages,
  getRecipes,
  searchRecipeByName,
  searchRecipeId,
  postRecipe,
  getSelfRecipes,
  deleteRecipe,
  savedRecipe,
  getTrendRecipes,
  getSavedRecipes,
  deleteSavedRecipe,
};

export default RecipeController;
