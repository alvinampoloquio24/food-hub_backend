import { NextFunction, Request, Response } from "express";
import axios from "axios";
import nlp from "compromise";
const apiKey = process.env.SPOON_KEY;
const baseURL = "https://api.spoonacular.com";

interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
}

const getRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  try {
    const response = await axios.get(`${baseURL}/recipes/findByIngredients`, {
      params: {
        ingredients: ingredients.join(","),
        number: 20, // Number of recipes to return
        apiKey: apiKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};

const getGeneratedRecipe = async (req: Request, res: Response) => {
  try {
    const normalizedText = req.body.search
      .replace(/[^a-zA-Z, ]/g, "")
      .toLowerCase();

    // Split on both spaces and commas
    const searchData = normalizedText
      .split(/[\s,]+/)
      .filter((word: string) => word.length > 0);

    const recipe = await getRecipes(searchData);

    return res.status(200).json(recipe);
  } catch (error) {
    console.error("Error generating recipe:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getRecipeInformation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`${baseURL}/recipes/${id}/information`, {
      params: {
        apiKey: apiKey,
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
};

export { getGeneratedRecipe, getRecipeInformation };
