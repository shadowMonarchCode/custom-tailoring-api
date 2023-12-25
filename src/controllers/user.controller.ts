// Importing necessary modules and models
import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";

// Importing authentication and password hashing utilities
import { authenticate, hashPassword } from "../utils";
import { AuthenticatedRequest } from "../types";
import Order, { IOrder } from "../models/order.model";

// Get current user details
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.user!;
    const user: IUser | null = await User.findById(userId)
      .select("-password")
      .populate({
        path: "orders",
        select: "",
        populate: {
          path: "customer",
          select: "name phone",
        },
      });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Get list of all users based on role
export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role, shops } = req.user!;
    let users: IUser[] | null;

    if (role === "Admin") {
      // Admin can see all users
      users = await User.find()
        .select("-password")
        .populate({
          path: "orders",
          select: "-measurements",
          populate: [
            {
              path: "customer",
              select: "name phone",
            },
            {
              path: "creator",
              select: "name",
            },
          ],
        });
    } else if (role === "Manager") {
      // Manager can see users within their shop
      users = await User.find({ shop: { $in: shops } })
        .select("-password")
        .populate({
          path: "orders",
          select: "-measurements",
          populate: [
            {
              path: "customer",
              select: "name phone",
            },
            {
              path: "creator",
              select: "name",
            },
          ],
        });
    } else {
      users = [];
    }

    if (!users) {
      res.status(404).json({ error: "User's list is empty" });
      return;
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later!" });
  }
};

// Get user by ID
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role, shops } = req.user!;
    const targetUserId = req.params.userId;

    // Admin can get any user by ID
    const user: IUser | null = await User.findById(targetUserId)
      .select("-password")
      .populate({
        path: "orders",
        select: "-measurements",
        populate: {
          path: "customer",
          select: "name phone",
        },
      });
    if (!user) {
      res.status(404).json({ error: "No user found with the specified ID" });
      return;
    }

    // Check access for Managers
    if (
      role === "Manager" &&
      (user.role === "Admin" ||
        !user.shops.some((shop) => shops.includes(shop)))
    ) {
      res
        .status(401)
        .json({ error: "Unauthorized: You do not have access to this user" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later!" });
  }
};

// Get user(s) by name
export const getUserByName = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role, shops } = req.user!;
    const targetName = req.params.name;

    let users = await User.find({
      name: { $regex: new RegExp(targetName, "i") },
    })
      .select("-password")
      .populate({
        path: "orders",
        select: "-measurements",
        populate: {
          path: "customer",
          select: "name phone",
        },
      });

    // Filter users based on role and shop for Managers
    if (role === "Manager") {
      users = users.filter(
        (user) =>
          user.role !== "Admin" &&
          user.shops.some((shop) => shops.includes(shop))
      );
    }

    if (users.length === 0) {
      res.status(404).json({ error: "No user found with the specified name" });
      return;
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later!" });
  }
};

// Get all unique shops
export const getAllUniqueShops = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role, shops } = req.user!;

    let uniqueShops: string[];

    if (role === "Manager") {
      uniqueShops = shops;
    } else {
      uniqueShops = await User.distinct("shop");
    }

    res.status(200).json(uniqueShops);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Update user password
export const updatePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId, role, shops } = req.user!;
  const { _id, newPassword } = req.body;

  try {
    const user: IUser | null = await User.findById(_id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Managers can only update passwords for users in their own shop
    if (
      role === "Manager" &&
      !user.shops.some((shop) => shops.includes(shop))
    ) {
      res.status(403).json({
        error: "Unauthorized: Cannot update password for this user",
      });
      return;
    }

    // Hash the password before saving
    const hashedPassword: string = await hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//TODO: Update user details
export const updateUserDetails = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId, role, shops } = req.user!;
  const { _id, newName, newEmail } = req.body;

  try {
    const user: IUser | null = await User.findById(_id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Managers can only update details for users in their own shop
    if (role === "Manager") {
      if (!user.shops.some((shop) => shops.includes(shop))) {
        res.status(403).json({
          error: "Unauthorized: Cannot update details for this user",
        });
        return;
      }
    }

    // Check if the new email is unique
    if (newEmail) {
      const existingUserWithEmail: IUser | null = await User.findOne({
        email: newEmail,
        _id: { $ne: _id },
      });
      if (existingUserWithEmail) {
        res.status(400).json({ error: "Email already in use by another user" });
        return;
      }
    }

    // Update user details
    user.name = newName || user.name;
    user.email = newEmail || user.email;
    await user.save();

    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//TODO: Update user shop
export const updateUserShop = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId, role, shops } = req.user!;
  const { _id, newShop } = req.body;

  try {
    const user: IUser | null = await User.findById(_id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (
      role !== "Admin" &&
      !shops.includes(newShop) &&
      !user.shops.some((shop) => shops.includes(shop))
    ) {
      res.status(403).json({
        error: "Unauthorized: Cannot update shop for this user",
      });
      return;
    }

    user.shops = newShop;
    await user.save();

    res.status(200).json({ message: "Shop updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Create a new user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, shops, role } = req.body;

    // Validate request body
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "Missing required field(s)." });
      return;
    }

    // Check if the email already exists
    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: "This email is already in use." });
      return;
    }

    // Hash the password before saving
    const hashedPassword: string = await hashPassword(password);

    // Create username
    const baseUsername = name.toLowerCase().replace(/\s/g, "");
    let username = baseUsername;
    let counter = 1;

    // Check if the generated username is already in use
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create a new user with or without the "shop" field
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      shops,
      role,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      username: savedUser.username,
      email: savedUser.email,
      shops: savedUser.shops,
      role: savedUser.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Login user
export const authenticateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Retrieve the user from the database based on the username
    const user: IUser | null = await User.findOne({ username });
    // If the user is not found, return null
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const token: string | null = await authenticate(
      password,
      user.password,
      user._id,
      user.role,
      user.shops
    );

    if (token) {
      // Authentication successful, send the token back to the client
      res.status(202).json({ token });
    } else {
      // Authentication failed
      res.status(401).json({ error: "Authentication failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete user by ID
export const deleteUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId, role, shops } = req.user!;
  const targetUserId = req.params.userId;

  try {
    const targetUser: IUser | null = await User.findById(targetUserId);

    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Managers can only delete users in their own shop
    if (
      role === "Manager" &&
      !targetUser.shops.some((shop) => shops.includes(shop))
    ) {
      res.status(403).json({
        error: "Unauthorized: Cannot delete this user",
      });
      return;
    }

    // Delete the user
    await User.findByIdAndDelete(targetUserId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
