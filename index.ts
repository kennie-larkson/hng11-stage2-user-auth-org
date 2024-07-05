import express from "express";
import { userRouter } from "./routes";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();

console.log(process.env.MY_NAME);

app.set("trust proxy", true);

app.use("/api", userRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export { app };
