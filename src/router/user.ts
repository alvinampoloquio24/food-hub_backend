import express from "express";
import UserController from "../controllers/user";
import auth from "../middleware/auth";
import upload from "../middleware/upload";
const router = express.Router();

router.post("/createAccount", UserController.createAccount);
router.post("/login", UserController.login);
router.post("/verifyEmail/:id", UserController.verifyEmailToken);
router.get("/getUser", auth, UserController.getUser);
router.delete("/deleteUser", auth, UserController.deleteUser);
router.post(
  "/updateUser",
  auth,
  upload.fields([{ name: "profile" }, { name: "coverPhoto" }]),
  UserController.updateUser
);

export default router;
