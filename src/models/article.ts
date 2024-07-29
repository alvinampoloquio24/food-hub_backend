import mongoose, { Schema, Document } from "mongoose";

interface IArticle extends Document {
  img: string;
  name: string;
  description: string;
  content: string;
}

const articleSchema: Schema = new Schema({
  img: {
    type: String,
  },
  name: String,
  description: String,
  content: String,
});

const articleModel = mongoose.model<IArticle>("Article", articleSchema);

export default articleModel;
