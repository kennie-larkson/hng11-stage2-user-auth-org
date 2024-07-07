"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Organization_1 = require("./entities/Organization");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: isProduction ? process.env.LIVE_DB_HOSTNAME : process.env.DB_HOST,
    port: isProduction
        ? parseInt(process.env.PROD_DB_PORT || "5432")
        : parseInt(process.env.DB_PORT || "5432"),
    username: isProduction ? process.env.LIVE_DB_USER : process.env.DB_USER,
    password: isProduction
        ? process.env.LIVE_DB_PASSWORD
        : process.env.DB_PASSWORD,
    database: isProduction ? process.env.LIVE_DB_NAME : process.env.DB_NAME,
    entities: [User_1.User, Organization_1.Organization],
    synchronize: isProduction ? false : true,
    //ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});
