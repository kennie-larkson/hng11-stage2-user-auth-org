// test/auth.spec.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "../utils/generateToken";
import { User } from "../entities/User";
import { IUser } from "../entities/User.interface";
import request from "supertest";
import { app } from "../index"; // Adjust the path according to your app entry point
import { AppDataSource } from "../data-source";
import { Organization } from "../entities/Organization";
import bcrypt from "bcryptjs";

jest.mock("jsonwebtoken");

describe("Auth Utils", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      sendStatus: jest.fn(),
    };
    next = jest.fn();
  });
  const user: IUser = {
    userId: "12345",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "password123",
    phone: "123-456-7890",
  };

  let token: any;

  it("should generate a token with correct user details", () => {
    token = generateToken(user);
    console.log("token", token);
  });

  it("should call next() if the token is valid", () => {
    const token = "valid-token";
    const mockUser = { userId: "12345" };

    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });

    verifyToken(req as Request, res as Response, next, token);

    expect((req as any).user).toBe(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if the token is invalid", () => {
    const token = "invalid-token";

    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(new Error("Invalid token"), null);
    });

    verifyToken(req as Request, res as Response, next, token);

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
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    const userRepository = AppDataSource.getRepository(User);
    const organizationRepository = AppDataSource.getRepository(Organization);

    // Delete records instead of truncating the tables
    await organizationRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();
  });

  it("should register a user successfully", async () => {
    const response = await request(app).post("/auth/register").send({
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
    const organizationRepository = AppDataSource.getRepository(Organization);
    const organization = await organizationRepository.findOneBy({
      name: "John's Organization",
    });
    expect(organization).toBeDefined();
  });

  it("should return validation errors", async () => {
    const response = await request(app).post("/auth/register").send({
      firstName: "",
      lastName: "",
      email: "invalid-email",
      password: "",
      phone: "",
    });

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
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
      ])
    );
  });

  it("should return a 400 error if the user already exists", async () => {
    const userRepository = AppDataSource.getRepository(User);

    // Pre-create a user
    const existingUser = new User();
    existingUser.firstName = "Jane";
    existingUser.lastName = "Doe";
    existingUser.email = "jane.doe@example.com";
    existingUser.password = await bcrypt.hash("password123", 10);
    existingUser.phone = "123-456-7890";
    await userRepository.save(existingUser);

    const response = await request(app).post("/auth/register").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      password: "password123",
      phone: "123-456-7890",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  it("should login a user successfully", async () => {
    const userRepository = AppDataSource.getRepository(User);

    // Pre-create a user
    const existingUser = new User();
    existingUser.firstName = "John";
    existingUser.lastName = "Doe";
    existingUser.email = "john.doe@example.com";
    existingUser.password = "password123";
    existingUser.phone = "123-456-7890";
    await userRepository.save(existingUser);

    const response = await request(app).post("/auth/login").send({
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
  });

  it("should return a 401 error if the email does not exist", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "non.existent@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should return a 401 error if the password is incorrect", async () => {
    const userRepository = AppDataSource.getRepository(User);

    // Pre-create a user
    const existingUser = new User();
    existingUser.firstName = "John";
    existingUser.lastName = "Doe";
    existingUser.email = "john.doe@example.com";
    existingUser.password = await bcrypt.hash("password123", 10);
    existingUser.phone = "123-456-7890";
    await userRepository.save(existingUser);

    const response = await request(app).post("/auth/login").send({
      email: "john.doe@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });
});
