import express from "express";
import { createArticle, getArticle } from "../controllers/article"; // Adjust the path to where your createPoster function is defined
import upload from "../middleware/upload";
import RecipeController from "../controllers/recipe";
import {
  getGeneratedRecipe,
  getRecipeInformation,
} from "../controllers/spoonacular";
import auth from "../middleware/auth";
const router = express.Router();

// Define the POST route for creating a new poster
router.post("/addArticle", upload.single("image"), auth, createArticle);

router.post(
  "/postRecipe",
  auth,
  upload.single("image"),
  RecipeController.postRecipe
);
router.post("/getGeneratedRecipe", getGeneratedRecipe);
router.get("/getArticles", getArticle);
router.get("/getTrendRecipes", RecipeController.getTrendRecipes);
router.get("/getRecipes", RecipeController.getRecipes);
router.get("/getRecipesPages", auth, RecipeController.getRecipesPages);
router.get("/getSelfRecipes", auth, RecipeController.getSelfRecipes);
router.get("/getRecipeByName", RecipeController.searchRecipeByName);
router.get("/findRecipeId/:id", RecipeController.searchRecipeId);
router.get("/findRecipeSpoonacular/:id", getRecipeInformation);
router.post("/savedRecipe/:id", auth, RecipeController.savedRecipe);
router.post(
  "/editRecipe/:id",
  auth,
  upload.single("image"),
  RecipeController.updateRecipe
);
router.get("/getSavedRecipes", auth, RecipeController.getSavedRecipes);
router.delete("/deleteRecipe/:id", auth, RecipeController.deleteRecipe);
router.delete(
  "/deleteSavedRecipe/:id",
  auth,
  RecipeController.deleteSavedRecipe
);
export default router;
