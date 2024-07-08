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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken_1 = require("../utils/generateToken");
const User_1 = require("../entities/User");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index"); // Adjust the path according to your app entry point
const data_source_1 = require("../data-source");
const Organization_1 = require("../entities/Organization");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
jest.mock("jsonwebtoken");
describe("Auth Utils", () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        req = {};
        res = {
            sendStatus: jest.fn(),
        };
        next = jest.fn();
    });
    const user = {
        userId: "12345",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        phone: "123-456-7890",
    };
    let token;
    it("should generate a token with correct user details", () => {
        token = (0, generateToken_1.generateToken)(user);
        console.log("token", token);
    });
    it("should call next() if the token is valid", () => {
        const token = "valid-token";
        const mockUser = { userId: "12345" };
        jsonwebtoken_1.default.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockUser);
        });
        (0, generateToken_1.verifyToken)(req, res, next, token);
        expect(req.user).toBe(mockUser);
        expect(next).toHaveBeenCalled();
    });
    it("should return 403 if the token is invalid", () => {
        const token = "invalid-token";
        jsonwebtoken_1.default.verify.mockImplementation((token, secret, callback) => {
            callback(new Error("Invalid token"), null);
        });
        (0, generateToken_1.verifyToken)(req, res, next, token);
        expect(res.sendStatus).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
// describe("POST /auth/register", () => {
//   beforeAll(async () => {
//     await AppDataSource.initialize();
//   });
//   afterAll(async () => {
//     await AppDataSource.destroy();
//   });
//   beforeEach(async () => {
//     const userRepository = AppDataSource.getRepository(User);
//     const organizationRepository = AppDataSource.getRepository(Organization);
//     // Delete records instead of truncating the tables
//     await organizationRepository.createQueryBuilder().delete().execute();
//     await userRepository.createQueryBuilder().delete().execute();
//   });
//   it("should register a user successfully", async () => {
//     const response = await request(app).post("/auth/register").send({
//       firstName: "John",
//       lastName: "Doe",
//       email: "john.doe@example.com",
//       password: "password123",
//       phone: "123-456-7890",
//     });
//     expect(response.status).toBe(201);
//     expect(response.body.status).toBe("success");
//     expect(response.body.data.user).toMatchObject({
//       firstName: "John",
//       lastName: "Doe",
//       email: "john.doe@example.com",
//       phone: "123-456-7890",
//     });
//     // Verify that the Organization was created with the correct name
//     const organizationRepository = AppDataSource.getRepository(Organization);
//     const organization = await organizationRepository.findOneBy({
//       name: "John's Organization",
//     });
//     expect(organization).toBeDefined();
//   });
//   it("should return validation errors", async () => {
//     const response = await request(app).post("/auth/register").send({
//       firstName: "",
//       lastName: "",
//       email: "invalid-email",
//       password: "",
//       phone: "",
//     });
//     expect(response.status).toBe(422);
//     expect(response.body.errors).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({
//           field: "firstName",
//           message: expect.any(String),
//         }),
//         expect.objectContaining({
//           field: "lastName",
//           message: expect.any(String),
//         }),
//         expect.objectContaining({
//           field: "email",
//           message: expect.any(String),
//         }),
//         expect.objectContaining({
//           field: "password",
//           message: expect.any(String),
//         }),
//       ])
//     );
//   });
//   it("should return a 400 error if the user already exists", async () => {
//     const userRepository = AppDataSource.getRepository(User);
//     // Pre-create a user
//     const existingUser = new User();
//     existingUser.firstName = "Jane";
//     existingUser.lastName = "Doe";
//     existingUser.email = "jane.doe@example.com";
//     existingUser.password = "password123";
//     existingUser.phone = "123-456-7890";
//     await userRepository.save(existingUser);
//     const response = await request(app).post("/auth/register").send({
//       firstName: "Jane",
//       lastName: "Doe",
//       email: "jane.doe@example.com",
//       password: "password123",
//       phone: "123-456-7890",
//     });
//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe("User already exists");
//   });
// });
describe("POST /auth/register and /auth/login", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield data_source_1.AppDataSource.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield data_source_1.AppDataSource.destroy();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const organizationRepository = data_source_1.AppDataSource.getRepository(Organization_1.Organization);
        // Delete records instead of truncating the tables
        yield organizationRepository.createQueryBuilder().delete().execute();
        yield userRepository.createQueryBuilder().delete().execute();
    }));
    it("should register a user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app).post("/auth/register").send({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "password123",
            phone: "123-456-7890",
        });
        expect(response.status).toBe(201);
        expect(response.body.status).toBe("success");
        expect(response.body.data.user).toMatchObject({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "123-456-7890",
        });
        // Verify that the Organization was created with the correct name
        const organizationRepository = data_source_1.AppDataSource.getRepository(Organization_1.Organization);
        const organization = yield organizationRepository.findOneBy({
            name: "John's Organization",
        });
        expect(organization).toBeDefined();
    }));
    it("should return validation errors", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app).post("/auth/register").send({
            firstName: "",
            lastName: "",
            email: "invalid-email",
            password: "",
            phone: "",
        });
        expect(response.status).toBe(422);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                field: "firstName",
                message: expect.any(String),
            }),
            expect.objectContaining({
                field: "lastName",
                message: expect.any(String),
            }),
            expect.objectContaining({
                field: "email",
                message: expect.any(String),
            }),
            expect.objectContaining({
                field: "password",
                message: expect.any(String),
            }),
        ]));
    }));
    it("should return a 400 error if the user already exists", () => __awaiter(void 0, void 0, void 0, function* () {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        // Pre-create a user
        const existingUser = new User_1.User();
        existingUser.firstName = "Jane";
        existingUser.lastName = "Doe";
        existingUser.email = "jane.doe@example.com";
        existingUser.password = yield bcryptjs_1.default.hash("password123", 10);
        existingUser.phone = "123-456-7890";
        yield userRepository.save(existingUser);
        const response = yield (0, supertest_1.default)(index_1.app).post("/auth/register").send({
            firstName: "Jane",
            lastName: "Doe",
            email: "jane.doe@example.com",
            password: "password123",
            phone: "123-456-7890",
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User already exists");
    }));
    it("should login a user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        // Pre-create a user
        const existingUser = new User_1.User();
        existingUser.firstName = "John";
        existingUser.lastName = "Doe";
        existingUser.email = "john.doe@example.com";
        existingUser.password = "password123";
        existingUser.phone = "123-456-7890";
        yield userRepository.save(existingUser);
        const response = yield (0, supertest_1.default)(index_1.app).post("/auth/login").send({
            email: "john.doe@example.com",
            password: "password123",
        });
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe("Login successful");
        expect(response.body.data.user).toMatchObject({
            userId: existingUser.userId,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "123-456-7890",
        });
    }));
    it("should return a 401 error if the email does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app).post("/auth/login").send({
            email: "non.existent@example.com",
            password: "password123",
        });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    }));
    it("should return a 401 error if the password is incorrect", () => __awaiter(void 0, void 0, void 0, function* () {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        // Pre-create a user
        const existingUser = new User_1.User();
        existingUser.firstName = "John";
        existingUser.lastName = "Doe";
        existingUser.email = "john.doe@example.com";
        existingUser.password = yield bcryptjs_1.default.hash("password123", 10);
        existingUser.phone = "123-456-7890";
        yield userRepository.save(existingUser);
        const response = yield (0, supertest_1.default)(index_1.app).post("/auth/login").send({
            email: "john.doe@example.com",
            password: "wrongpassword",
        });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    }));
});
