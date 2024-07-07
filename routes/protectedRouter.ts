import { Request, Response } from "express";

import { authenticateJWT } from "../utils/jwt_middleware";
import { userRouter } from "./userRouter";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

userRouter.get(
  "/profile",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ userId });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);
