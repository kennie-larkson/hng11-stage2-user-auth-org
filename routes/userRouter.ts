import express, { Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Organization } from "../entities/Organization";
import { authenticateJWT } from "../utils/jwt_middleware";
import { generateToken, verifyToken } from "../utils/generateToken";
import { IUser } from "../entities/User.interface";

const userRouter = express.Router();

userRouter.post("/register", async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);

    const organizationRepository = AppDataSource.getRepository(Organization);
    // Check if user already exists
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.password = password;
    user.phone = phone;

    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(422).json({
        errors: errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints!).join(", "),
        })),
      });
    }

    // Create default organization
    const organization = new Organization();
    organization.name = `${user.firstName}'s Organization`;
    organization.users = [user];

    const orgErrors = await validate(organization);
    if (orgErrors.length > 0) {
      return res.status(422).json({
        errors: orgErrors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints!).join(", "),
        })),
      });
    }

    await organizationRepository.save(organization);

    // Generate JWT token
    const accessToken = generateToken(user);
    // save new User
    await userRepository.save(user);

    // Return success response
    res.status(201).json({
      status: "success",
      message: "Registration successful",
      data: {
        accessToken,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });

    //res.status(201).json(user);
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(422).json({
        errors: [
          {
            field: error.detail.includes("email") ? "email" : "userId",
            message: error.detail.includes("email")
              ? "Email must be unique"
              : "UserId must be unique",
          },
        ],
      });
    }
    //res.status(500).json({ message: "Server error", error });
    console.error("Registration Error", error);

    return res.status(400).json({
      status: "Bad request",
      message: "Registration unsuccessful",
      statusCode: 400,
    });
  }
});

userRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const accessToken = generateToken(user);

    // Return success response
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        accessToken,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error: any) {
    if (error) {
      res.status(401).json({
        status: "Bad request",
        message: "Authentication failed",
        statusCode: 401,
      });
    }
    res.status(500).json({ message: "Server error", error });
  }
});

// New endpoint to get user details
userRouter.get(
  "/users/:id",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const requestingUserId = (req as any).user.userId;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const organizationRepository = AppDataSource.getRepository(Organization);

      const user = await userRepository.findOneBy({ userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the requesting user is allowed to access the user's data
      const organizations = await organizationRepository
        .createQueryBuilder("organization")
        .leftJoinAndSelect("organization.users", "user")
        .where("user.userId = :userId", { userId: requestingUserId })
        .getMany();

      const isAuthorized = organizations.some((org) =>
        org.users.some((u) => u.userId === userId)
      );
      if (requestingUserId !== userId && !isAuthorized) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Return success response
      res.status(200).json({
        status: "success",
        message: "User retrieved successfully",
        data: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export { userRouter };
