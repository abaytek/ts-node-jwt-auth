import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { prisma } from "../utils/prisma";
import * as bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { errorHandler } from "../utils/errorHandler";
import { JwtPayload, VerifyOptions } from "jsonwebtoken";
import { client } from "../utils/redis";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    // validate user request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array().at(0)?.msg);
    }

    // check if user already exist in db
    const userExist = await prisma.user.findFirst({ where: { email: email } });

    if (userExist) {
      return next(createHttpError.NotAcceptable("user already exist"));
    }

    // hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    // save the user
    const user = await prisma.user.create({
      data: {
        ...req.body,
        password: hashedPassword,
      },
    });
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    res.json({ status: 200, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    // validate user request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array().at(0)?.msg);
    }

    // check if user already exist in db
    const user = await prisma.user.findFirst({ where: { email: email } });

    if (!user) {
      return next(
        createHttpError.Unauthorized(
          "user with this email/password doesn't exist"
        )
      );
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      next(createHttpError.Unauthorized("Email/password do not match"));

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({ status: 200, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const refreshJwtToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken: token } = req.body;
  try {
    if (!token) next(createHttpError.Unauthorized());

    const userId = verifyRefreshToken(token);
    const dbToken = await client.get(userId);
    if (dbToken === token)
      return createHttpError.Unauthorized("refresh token is revoked");
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    res.json({ status: 200, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};
