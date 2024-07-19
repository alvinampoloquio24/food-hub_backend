import express, { Request, Response } from "express";
import connectToDatabase from "./config/db";
import poster from "./router/poster";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
connectToDatabase();

app.use(cors);
app.use(poster);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
});
