import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  status?: number;
  kind?: string;
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
  // You might want to handle any other specific Mongoose errors or general errors here

  // Final error response
  const errMessage = error.message || "Something went wrong";
  const errStatus = error.status || 500; // Internal Server Error as a default

  // Logging the error for debugging purposes
  console.error(error);

  res.status(errStatus).json({ message: errMessage });

  return next();
};

export default errorHandler;
