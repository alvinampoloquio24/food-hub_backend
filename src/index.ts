import express, { Request, Response } from "express";
import connectToDatabase from "./config/db";
import poster from "./router/poster";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors()); // Use cors() as a function
connectToDatabase();

app.use(poster);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
