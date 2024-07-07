import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Organization } from "./entities/Organization";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
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
  entities: [User, Organization],
  synchronize: isProduction ? false : true,
  //ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
