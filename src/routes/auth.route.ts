import express, { Request, Response } from "express";
import {
  login,
  refreshJwtToken,
  register,
} from "../controllers/auth.controller";
import { body } from "express-validator";

const router = express.Router();

router.post(
  "/register",
  [
    body("firstName")
      .notEmpty()
      .withMessage("First Name Cannot Be Empty")
      .isString()
      .trim()
      .isLength({ min: 2 }),
    body("lastName")
      .notEmpty()
      .withMessage("Last Name Cannot Be Empty")
      .isString()
      .trim()
      .isLength({ min: 2 }),
    body("email")
      .notEmpty()
      .withMessage("Email Cannot Be Empty")
      .isEmail()
      .withMessage("Invalid Email")
      .normalizeEmail(),
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Passwors should be a minimum of 8 characters"),
  ],
  register
);
router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email Cannot Be Empty")
      .isEmail()
      .withMessage("Invalid Email")
      .normalizeEmail(),
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Passwors should be a minimum of 8 characters"),
  ],
  login
);
router.post("/refresh-token", refreshJwtToken);
export default router;
