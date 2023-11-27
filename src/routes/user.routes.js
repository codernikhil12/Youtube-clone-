import { Router } from "express";

import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.route("/register").post(
  // upload.fields akta array of object accept kore
  upload.fields([
    {
      name: "avatar",
      maxCount: 2,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
