import express from "express";
import {
  userRouter,
  indexRouter,
  organizationRouter,
  authRouter,
} from "./routes/index";
import { AppDataSource } from "./data-source";
import dotenv from "dotenv";

const app = express();
dotenv.config();
app.use(express.json());

const port = process.env.PORT || 7000;

app.set("trust proxy", true);

app.use("/api", [organizationRouter, userRouter]);
app.use("/auth", authRouter);
app.use("/", indexRouter);

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });

export default app;
