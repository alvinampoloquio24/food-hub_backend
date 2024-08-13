import mongoose, { Schema, Document, Model } from "mongoose";

interface IIngredient {
  name: string;
  quantity: string;
  unit: string;
}
interface Idirection {
  tittle: string;
  description: string;
}

interface IRecipe extends Document {
  name: String;
  img: string;
  description: string;
  time: string;
  dishType: string;
  userId: { type: mongoose.Schema.Types.ObjectId; ref: "User" };
  ingredients: IIngredient[];
  directions: Idirection;
}

const ingredientSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
  },
});
const directionSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const recipeSchema: Schema = new Schema(
  {
    img: {
      type: String,
    },
    description: {
      type: String,
    },
    name: {
      type: String,
    },
    time: {
      type: String,
    },
    cal: {
      type: String,
    },
    dishType: {
      type: String,
    },
    ingredients: {
      type: [ingredientSchema],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    directions: {
      type: [directionSchema],
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const RecipeModel = mongoose.model<IRecipe>("Recipe", recipeSchema);

export default RecipeModel;
