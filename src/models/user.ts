import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with our new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    // Compare the candidate password with the stored hash
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
