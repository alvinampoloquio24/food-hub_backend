import express, { Request, Response } from "express";
import connectToDatabase from "./config/db";
import recipe from "./router/recipe";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";
import user from "./router/user";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors()); // Use cors() as a function
connectToDatabase();

app.use(recipe);
app.use(user);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
