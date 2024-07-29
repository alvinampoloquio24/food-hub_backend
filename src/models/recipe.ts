import mongoose, { Schema, Document, Model } from "mongoose";

interface IIngredient {
  name: string;
  quantity: string;
}
interface Idirection {
  tittle: string;
  description: string;
}

interface IRecipe extends Document {
  dishId: { type: mongoose.Schema.Types.ObjectId; ref: "Poster" };
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

const recipeSchema: Schema = new Schema({
  dishId: { type: mongoose.Schema.Types.ObjectId, ref: "Poster" },
  ingredients: {
    type: [ingredientSchema],
    required: true,
  },
  directions: {
    type: [directionSchema],
    required: true,
    unique: true,
  },
});

// Adding a unique index on dishId to enforce uniqueness
recipeSchema.index({ dishId: 1 }, { unique: true });

// Pre-save hook to check for existing dishId
recipeSchema.pre("save", async function (next) {
  const recipe = this as unknown as IRecipe;
  const existingRecipe = await (this.constructor as Model<IRecipe>).findOne({
    dishId: recipe.dishId,
  });
  if (existingRecipe) {
    next(new Error("A recipe with this dishId already exists"));
  } else {
    next();
  }
});

const RecipeModel = mongoose.model<IRecipe>("Recipe", recipeSchema);

export default RecipeModel;
