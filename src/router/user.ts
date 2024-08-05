import express from "express";
import UserController from "../controllers/user";
const router = express.Router();

router.post("/createAccount", UserController.createAccount);
router.post("/login", UserController.login);
router.post("/verifyEmail/:id", UserController.verifyEmailToken);
export default router;
