"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRouter = void 0;
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const data_source_1 = require("../data-source");
const Organization_1 = require("../entities/Organization");
const User_1 = require("../entities/User");
const jwt_middleware_1 = require("../utils/jwt_middleware");
const organizationRouter = (0, express_1.Router)();
exports.organizationRouter = organizationRouter;
organizationRouter.post("/organizations", jwt_middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    const userId = req.user.userId;
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOneBy({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const organization = new Organization_1.Organization();
        organization.name = `${user.firstName}'s Organization`;
        organization.description = description;
        organization.users = [user];
        const errors = yield (0, class_validator_1.validate)(organization);
        if (errors.length > 0) {
            return res.status(422).json({
                errors: errors.map((error) => ({
                    field: error.property,
                    message: Object.values(error.constraints).join(", "),
                })),
            });
        }
        const organizationRepository = data_source_1.AppDataSource.getRepository(Organization_1.Organization);
        yield organizationRepository.save(organization);
        res.status(201).json(organization);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
organizationRouter.get("/organizations", jwt_middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const organizationRepository = data_source_1.AppDataSource.getRepository(Organization_1.Organization);
        const organizations = yield organizationRepository
            .createQueryBuilder("organization")
            .leftJoinAndSelect("organization.users", "user")
            .where("user.userId = :userId", { userId })
            .getMany();
        res.status(200).json(organizations);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
// New endpoint to get a single organization
organizationRouter.get("/organizations/:orgId", jwt_middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orgId } = req.params;
    const userId = req.user.userId;
    try {
        const organizationRepository = data_source_1.AppDataSource.getRepository(Organization_1.Organization);
        const organization = yield organizationRepository
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
// New endpoint to create an organization
organizationRouter.post("/organizations", jwt_middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    const userId = req.user.userId;
    try {
        // Validate request body
        if (!name) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Name is required",
                statusCode: 400,
            });
        }
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const organizationRepository = data_source_1.AppDataSource.getRepository(Organization_1.Organization);
        const user = yield userRepository.findOneBy({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Create new organization
        const organization = new Organization_1.Organization();
        organization.name = name;
        organization.description = description;
        organization.users = [user];
        const orgErrors = yield (0, class_validator_1.validate)(organization);
        if (orgErrors.length > 0) {
            return res.status(422).json({
                errors: orgErrors.map((error) => ({
                    field: error.property,
                    message: Object.values(error.constraints).join(", "),
                })),
            });
        }
        yield organizationRepository.save(organization);
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
// New endpoint to add a user to an organization
organizationRouter.post("/organizations/:orgId/users", jwt_middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orgId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.userId;
    try {
        // Validate request body
        if (!userId) {
            return res.status(400).json({
                status: "Bad Request",
                message: "User ID is required",
                statusCode: 400,
            });
        }
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const organizationRepository = data_source_1.AppDataSource.getRepository(Organization_1.Organization);
        const user = yield userRepository.findOneBy({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const organization = yield organizationRepository
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
        yield organizationRepository.save(organization);
        // Return success response
        res.status(200).json({
            status: "success",
            message: "User added to organization successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
