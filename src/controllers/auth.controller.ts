import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { prisma } from "../utils/prisma";
import * as bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/jwt";
import { errorHandler } from "../utils/errorHandler";

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
    res.json({ status: 200, accessToken });
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
    res.json({ status: 200, accessToken });
  } catch (error) {
    next(error);
  }
};
