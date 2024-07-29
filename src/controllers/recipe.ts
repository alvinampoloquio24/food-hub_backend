import { NextFunction, Request, Response } from "express";
import Recipe from "../models/recipe"; // Adjust the import path as needed
import PosterService from "../services.ts/poster";
import mongoose from "mongoose";

const addRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const poster = await PosterService.findPoster(id);
    console.log(poster);
    if (!poster) {
      return res.status(400).json({ message: "No poster in this Id. " });
    }

    const recipe = await Recipe.create({
      dishId: id,
      ingredients: req.body.ingredients,
      directions: req.body.directions, // Assuming req.body.ingredients is an array of ingredients
    });
    return res.status(201).json({ message: "Add successfully. ", recipe });
  } catch (error) {
    return next(error);
  }
};

const updateRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const recipe = await Recipe.findById(id); // Ensuring uniqueness check
    if (!recipe) {
      return res.status(400).json({ message: "No recipe found with this id." });
    }
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipe._id,
      {
        ingredients: req.body.ingredients,
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Validate the update against the schema
      }
    );
    return res
      .status(200)
      .json({ message: "Updated successfully", updatedRecipe });
  } catch (error) {
    return next(error);
  }
};

const findRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(400).json({ message: "No recipe in this Id. " });
    }
    return res.status(200).json(recipe);
  } catch (error) {
    return next(error);
  }
};
const getRecipeByDishId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    const dish: any = await PosterService.findPoster(id);
    if (!dish) {
      return res.status(200).json({ message: "No poster in this id. " });
    }

    let recipe: any = await Recipe.findOne({
      dishId: id,
    });

    if (!recipe) {
      return res.status(200).json({ message: "No recipe in this id. " });
    }

    return res.status(200).json({ recipe: { ...recipe._doc, ...dish._doc } });
  } catch (error) {
    return next(error);
  }
};
const findAllRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipes = await Recipe.find();
    return res.status(200).json(recipes);
  } catch (error) {
    return next(error);
  }
};

const RecipeController = {
  addRecipe,
  updateRecipe,
  findRecipe,
  getRecipeByDishId,
  findAllRecipe,
};

export default RecipeController;
