import mongoose, { Schema, Document } from "mongoose";

interface Iposter extends Document {
  img: string;
  name: string;
  description: string;
  time: string;
  dishType: string;
}

const posterSchema: Schema = new Schema(
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
  },
  { timestamps: true }
);

const posterModel = mongoose.model<Iposter>("Poster", posterSchema);

export default posterModel;
