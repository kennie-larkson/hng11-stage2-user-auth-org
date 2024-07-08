// src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "./generateToken";

dotenv.config();

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    verifyToken(req, res, next, token);

    // jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    //   if (err) {
    //     return res.sendStatus(403);
    //   }

    //   (req as any).user = user;
    //   next();
    // });
  } else {
    res.sendStatus(401);
  }
};
