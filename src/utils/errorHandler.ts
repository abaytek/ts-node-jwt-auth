import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";

export const errorHandler = (
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.status || 500).json({
    status: error.status || 500,
    message: error.message || "Internal server Error",
  });
};
