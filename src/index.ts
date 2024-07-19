import express, { Request, Response } from "express";
import connectToDatabase from "./config/db";
import poster from "./router/poster";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
connectToDatabase();
console.log(process.env.CLOUD_NAME);

app.use(poster);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
});
