import { Request, Response, NextFunction } from "express";
import brypt from "bcrypt";
import User from "../models/user";
import sendAccountCreationEmail from "../email/sendEmail";
import { createToken, verifyTokenEmail } from "../helper/token";
const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userExist = await User.findOne({
      verified: true,
      email: req.body.email,
    });
    if (userExist) {
      return res.status(400).json({ message: "Email already in used. fff" });
    }
    const user = await User.create(req.body);
    const token = createToken({ userId: user._id!.toString() }); // Assuming _id is of type ObjectId
    await sendAccountCreationEmail({
      to: req.body.email,
      username: user.name,
      verificationToken: token,
    });
    return res.status(200).json({ message: "Success", user });
  } catch (error) {
    return next(error);
  }
};
const verifyEmailToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = verifyTokenEmail(req.params.id);
    if (!data) {
      return res.status(400).json({ message: "Error verifying the token " });
    }
    const user = await User.findById(data.userId);
    if (user?.verified) {
      return res.status(400).json({ message: "Token has already been used." });
    } else if (!user) {
      return res
        .status(400)
        .json({ message: "No account linked to this token." });
    }

    console.log(user);
    await User.findByIdAndUpdate(
      user?._id,
      {
        verified: true,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Congrats your account is verified." });
  } catch (error) {
    return next(error);
  }
};
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || user.verified == false) {
      return res.status(400).json({ message: "Wrong creadentils. " });
    }
    const isMatch = user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong creadentils. " });
    }
    const token = createToken({ userId: user._id!.toString() });
    return res.status(200).json({ user, token });
  } catch (error) {
    return next(error);
  }
};
const UserController = { createAccount, verifyEmailToken, login };
export default UserController;
