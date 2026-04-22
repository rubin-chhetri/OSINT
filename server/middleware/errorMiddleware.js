import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || "Internal Server Error";
  }

  const response = {
    success: false,
    status: statusCode,
    message,
    // Only show stack trace in development for debugging
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Log the error for the developer
  if (process.env.NODE_ENV === "development") {
    console.error(`[Error] ${statusCode} - ${message}`);
  }

  res.status(statusCode).json(response);
};

export default errorMiddleware;
