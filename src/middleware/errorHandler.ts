import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";

interface CustomError extends Error {
  status?: number;
  kind?: string;
  code?: number;
  keyPattern?: { [key: string]: any };
}

const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Checking for Mongoose validation error
  if (error.name === "ValidationError") {
    error.message = "Invalid data format";
    error.status = 400; // Bad Request
  }

  // Checking for Mongoose cast error (commonly occurs with an invalid ObjectId)
  else if (error.name === "CastError" && error.kind === "ObjectId") {
    error.message = "Invalid ID format";
    error.status = 400; // Bad Request
  }
  // Token errors remain the same
  else if (error.name === "TokenExpiredError") {
    error.message = "Token has expired";
    error.status = 401; // Unauthorized
  } else if (error.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.status = 400; // Bad Request
  }
  // Handling duplicate key error (e.g., duplicate email)
  else if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
    error.message = "Email already exists";
    error.status = 400; // Bad Request
  }

  // Handling custom file filter errors (e.g., unsupported file types)
  else if (error.message === "File type not supported") {
    error.status = 400; // Bad Request
  }
  // Final error response
  const errMessage = error.message || "Something went wrong";
  const errStatus = error.status || 500; // Internal Server Error as a default

  // Logging the error for debugging purposes
  console.error(error);

  res.status(errStatus).json({ message: errMessage });

  return next();
};
//check 123
export default errorHandler;
