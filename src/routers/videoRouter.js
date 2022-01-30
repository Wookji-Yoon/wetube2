import express from "express";
import {
  watch,
  getUpload,
  getEdit,
  postEdit,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { privateOnlyMiddleware, videoUpload } from "../middleware";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(privateOnlyMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(privateOnlyMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(privateOnlyMiddleware)
  .get(getUpload)
  .post(videoUpload.single("video"), postUpload);

export default videoRouter;
