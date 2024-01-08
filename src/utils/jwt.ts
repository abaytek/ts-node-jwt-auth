import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: any) => {
  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 + 2,
      data: userId,
    },
    process.env.JWT_SECRET as string
  );
  if (!token) createHttpError.InternalServerError();
  return token;
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1] as string;

  jwt.verify(
    token,
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    (err, payload) => {
      if (err) {
        const message =
          err.name == "JsonWebTokenError" ? "UnAuthorized" : err.message;
        next(createHttpError.Unauthorized(message));
      }

      (req as any).payload = payload;
      next();
    }
  );
};
