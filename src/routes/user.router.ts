// Importing Express and Router
import express, { Router } from "express";

// Importing user controller functions
import {
  authenticateUser,
  createUser,
  deleteUserById,
  getAllUniqueShops,
  getAllUsers,
  getCurrentUser,
  getUserById,
  getUserByName,
  updatePassword,
  updateUserDetails,
  updateUserShop,
} from "../controllers/user.controller";

// Importing middleware functions
import {
  isAdmin,
  isAdminOrManager,
  isAuthenticated,
  verifyToken,
} from "../middleware";

// Creating Express Router
const userRouter: Router = express.Router();

//* GET routes
// Get current user
userRouter.get("/", verifyToken, isAuthenticated, getCurrentUser);

// Get all users (Admin/Manager)
userRouter.get("/get-all", verifyToken, isAdminOrManager, getAllUsers);

// Get user by ID (Admin/Manager)
userRouter.get("/id/:userId", verifyToken, isAdminOrManager, getUserById);

// Search user by name (Admin/Manager)
userRouter.get("/search/:name", verifyToken, isAdminOrManager, getUserByName);

// Get unique shops (Admin/Manager)
userRouter.get("/shop-list", verifyToken, isAdminOrManager, getAllUniqueShops);

//* PUT routes
// Update user password (Admin)
userRouter.put("/update/password", verifyToken, isAdmin, updatePassword);

// Update user details (Admin)
userRouter.put("/update", verifyToken, isAdmin, updateUserDetails);

// Update user shop info (Admin)
userRouter.put("/update/shop", verifyToken, isAdmin, updateUserShop);

//* POST routes
// Create user (Admin/Manager)
userRouter.post("/createUser", verifyToken, isAdminOrManager, createUser);

// User login authentication
userRouter.post("/login", authenticateUser);

//* DELETE route
// Delete user by ID (Admin)
userRouter.delete("/:userId", verifyToken, isAdmin, deleteUserById);

export default userRouter;
