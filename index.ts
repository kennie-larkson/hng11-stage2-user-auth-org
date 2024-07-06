import express from "express";
import { userRouter, indexRouter } from "./routes/index";
import dotenv from "dotenv";

const app = express();
dotenv.config();

const port = process.env.PORT || 7000;

app.set("trust proxy", true);

app.use("/api", [userRouter]);
app.use("/", indexRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
