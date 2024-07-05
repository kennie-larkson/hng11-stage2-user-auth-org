import express, { Request, Response } from "express";

const userRouter = express.Router();

userRouter.get("/user", async (req: Request, res: Response) => {
  try {
    res.json({ message: "I am the user" });
  } catch (error) {
    console.log(error);
    res.send("Sorry, we are unable to complete this request");
  }
});

export { userRouter };
