import { config as dotenvConfig } from "dotenv";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables from the .env file
dotenvConfig({
  path: join(__dirname, "..", "config", ".env"),
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,
  api_key: process.env.COUDINARY_KEY!,
  api_secret: process.env.COUDINARY_SECRET_KEY!,
});

// Export the configured Cloudinary instance
export default cloudinary;
