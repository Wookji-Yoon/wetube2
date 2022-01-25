import express from "express";
import {
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import { privateOnlyMiddleware, publicOnlyMiddleware } from "../middleware";
import User from "../models/User";

const userRouter = express.Router();

userRouter.get("/logout", privateOnlyMiddleware, logout);
userRouter
  .route("/edit")
  .all(privateOnlyMiddleware)
  .get(getEdit)
  .post(postEdit);
userRouter
  .route("/change-password")
  .all(privateOnlyMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get(":id", see);

export default userRouter;
