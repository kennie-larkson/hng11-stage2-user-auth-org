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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const class_validator_1 = require("class-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const Organization_1 = require("../entities/Organization");
const jwt_middleware_1 = require("../utils/jwt_middleware");
const generateToken_1 = require("../utils/generateToken");
const userRouter = express_1.default.Router();
exports.userRouter = userRouter;
const authRouter = express_1.default.Router();
exports.authRouter = authRouter;
authRouter.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, phone } = req.body;
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const organizationRepository = data_source_1.AppDataSource.getRepository(Organization_1.Organization);
        // Check if user already exists
        const existingUser = yield userRepository.findOneBy({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = new User_1.User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.password = password;
        user.phone = phone;
        const errors = yield (0, class_validator_1.validate)(user);
        if (errors.length > 0) {
            return res.status(422).json({
                errors: errors.map((error) => ({
                    field: error.property,
                    message: Object.values(error.constraints).join(", "),
                })),
            });
        }
        // Create default organization
        const organization = new Organization_1.Organization();
        organization.name = `${user.firstName}'s Organization`;
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
        // Generate JWT token
        const accessToken = (0, generateToken_1.generateToken)(user);
        // save new User
        yield userRepository.save(user);
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
    }
    catch (error) {
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
}));
authRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOneBy({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Generate JWT token
        const accessToken = (0, generateToken_1.generateToken)(user);
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
    }
    catch (error) {
        if (error) {
            res.status(401).json({
                status: "Bad request",
                message: "Authentication failed",
                statusCode: 401,
            });
        }
        res.status(500).json({ message: "Server error", error });
    }
}));
// New endpoint to get user details
userRouter.get("/users/:id", jwt_middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const requestingUserId = req.user.userId;
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const organizationRepository = data_source_1.AppDataSource.getRepository(Organization_1.Organization);
        const user = yield userRepository.findOneBy({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if the requesting user is allowed to access the user's data
        const organizations = yield organizationRepository
            .createQueryBuilder("organization")
            .leftJoinAndSelect("organization.users", "user")
            .where("user.userId = :userId", { userId: requestingUserId })
            .getMany();
        const isAuthorized = organizations.some((org) => org.users.some((u) => u.userId === userId));
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
