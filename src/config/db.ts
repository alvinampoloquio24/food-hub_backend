import mongoose from "mongoose";

const connectToDatabase = async () => {
  console.log("Starting database connection...");
  try {
    const uri = process.env.MONGODB_URL!;

    // Connect to MongoDB
    await mongoose.connect(uri);

    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if unable to connect
  }
};

export default connectToDatabase;
