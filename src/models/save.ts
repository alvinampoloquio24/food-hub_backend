import mongoose, { Schema, Document } from "mongoose";

interface ISave extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  savedRecipes: Array<{ recipeId: string }>;
}

const saveSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  savedRecipes: [
    {
      recipeId: {
        type: String,
      },
    },
  ],
});

const SaveModel = mongoose.model<ISave>("Save", saveSchema);

export default SaveModel;
