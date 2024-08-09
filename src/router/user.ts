import express from "express";
import UserController from "../controllers/user";
import auth from "../middleware/auth";
import upload from "../middleware/upload";
const router = express.Router();

router.post("/createAccount", UserController.createAccount);
router.post("/login", UserController.login);
router.post("/verifyEmail/:id", UserController.verifyEmailToken);
router.post(
  "/updateUser",
  auth,
  upload.single("image"),
  UserController.updateUser
);

export default router;
