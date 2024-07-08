import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { IUser } from "../entities/User.interface";

// Generate JWT token

export function generateToken(user: IUser) {
  const accessToken = jwt.sign(
    { userId: user.userId },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    }
  );

  return accessToken;
}

export function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
  token: any
) {
  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.sendStatus(403);
    }

    (req as any).user = user;
    next();
  });
}
