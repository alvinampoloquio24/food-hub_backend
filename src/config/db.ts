import mongoose from "mongoose";

const connectToDatabase = async () => {
  console.log("Starting database connection...");
  try {
    const uri = "mongodb://127.0.0.1:27017/food-hub";

    // Connect to MongoDB
    await mongoose.connect(uri);

    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if unable to connect
  }
};

export default connectToDatabase;
