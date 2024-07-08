import { Router, Request, Response } from "express";
import { validate } from "class-validator";
import { AppDataSource } from "../data-source";
import { Organization } from "../entities/Organization";
import { User } from "../entities/User";
import { authenticateJWT } from "../utils/jwt_middleware";

const organizationRouter = Router();

organizationRouter.post(
  "/organisations",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const { description } = req.body;
    const userId = (req as any).user.userId;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ userId });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const organization = new Organization();
      organization.name = `${user.firstName}'s Organization`;
      organization.description = description;
      organization.users = [user];

      const errors = await validate(organization);
      if (errors.length > 0) {
        return res.status(422).json({
          errors: errors.map((error) => ({
            field: error.property,
            message: Object.values(error.constraints!).join(", "),
          })),
        });
      }

      const organizationRepository = AppDataSource.getRepository(Organization);
      await organizationRepository.save(organization);

      res.status(201).json(organization);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

organizationRouter.get(
  "/organisations",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
      const organizationRepository = AppDataSource.getRepository(Organization);
      const organizations = await organizationRepository
        .createQueryBuilder("organization")
        .leftJoinAndSelect("organization.users", "user")
        .where("user.userId = :userId", { userId })
        .getMany();

      res.status(200).json(organizations);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// New endpoint to get a single organization
organizationRouter.get(
  "/organisations/:orgId",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const userId = (req as any).user.userId;

    try {
      const organizationRepository = AppDataSource.getRepository(Organization);

      const organization = await organizationRepository
        .createQueryBuilder("organization")
        .leftJoinAndSelect("organization.users", "user")
        .where("organization.orgId = :orgId", { orgId })
        .andWhere("user.userId = :userId", { userId })
        .getOne();

      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Return success response
      res.status(200).json({
        status: "success",
        message: "Organization retrieved successfully",
        data: {
          orgId: organization.orgId,
          name: organization.name,
          description: organization.description,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// New endpoint to create an organization
organizationRouter.post(
  "/organisations",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const userId = (req as any).user.userId;

    try {
      // Validate request body
      if (!name) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Name is required",
          statusCode: 400,
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const organizationRepository = AppDataSource.getRepository(Organization);

      const user = await userRepository.findOneBy({ userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create new organization
      const organization = new Organization();
      organization.name = name;
      organization.description = description;
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

      // Return success response
      res.status(201).json({
        status: "success",
        message: "Organization created successfully",
        data: {
          orgId: organization.orgId,
          name: organization.name,
          description: organization.description,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// New endpoint to add a user to an organization
organizationRouter.post(
  "/organisations/:orgId/users",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { userId } = req.body;
    const currentUserId = (req as any).user.userId;

    try {
      // Validate request body
      if (!userId) {
        return res.status(400).json({
          status: "Bad Request",
          message: "User ID is required",
          statusCode: 400,
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const organizationRepository = AppDataSource.getRepository(Organization);

      const user = await userRepository.findOneBy({ userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const organization = await organizationRepository
        .createQueryBuilder("organization")
        .leftJoinAndSelect("organization.users", "user")
        .where("organization.orgId = :orgId", { orgId })
        .andWhere("user.userId = :currentUserId", { currentUserId })
        .getOne();

      if (!organization) {
        return res
          .status(404)
          .json({ message: "Organization not found or access denied" });
      }

      organization.users.push(user);

      await organizationRepository.save(organization);

      // Return success response
      res.status(200).json({
        status: "success",
        message: "User added to organization successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export { organizationRouter };
