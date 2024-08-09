import express from "express";
import {
  createPoster,
  getPoster,
  searchPoster,
  searchPosterWithName,
  createArticle,
  getArticle,
} from "../controllers/poster"; // Adjust the path to where your createPoster function is defined
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

router.post("/addPoster", upload.single("image"), createPoster);
router.get("/getPosters", getPoster);
router.post("/getGeneratedRecipe", getGeneratedRecipe);
router.get("/getArticles", getArticle);
router.get("/getRecipes", RecipeController.findAllRecipe);
router.get("/findPoster/:id", searchPoster);
router.get("/findRecipeSpoonacular/:id", getRecipeInformation);
router.post("/addRecipe/:id", RecipeController.addRecipe);
router.patch("/updateRecipe/:id", RecipeController.updateRecipe);
router.get("/findRecipe/:id", RecipeController.findRecipe);
router.get("/findRecipeByDishId/:id", RecipeController.getRecipeByDishId);
router.get("/searhRecipe", searchPosterWithName);
export default router;
