import express, { Request, Response } from "express";

const indexRouter = express.Router();

indexRouter.get("/", async (req: Request, res: Response) => {
  try {
    res.send("Server is running...");
  } catch (error) {
    console.log(error);
    res.send("Sorry, we are unable to complete this request");
  }
});

export { indexRouter };
