import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import authRoute from "./routes/auth.route";
import createHttpError from "http-errors";
import { errorHandler } from "./utils/errorHandler";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/auth", authRoute);

// 404
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createHttpError.NotFound());
});

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log("backend running on port " + process.env.PORT);
});
