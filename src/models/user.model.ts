import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  shop: string[];
  orders: string[];
  role: string;
}

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shop: { type: [String], default: [] },
  orders: { type: [mongoose.Schema.Types.ObjectId], ref: "Order", default: [] },
  role: { type: String, default: "User", enum: ["Admin", "Manager", "User"] },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
