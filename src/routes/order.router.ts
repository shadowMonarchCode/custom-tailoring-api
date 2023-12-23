import express, { Router } from "express";
import {
  createOrder,
  deleteOrderById,
  getAllOrders,
  getOrderById,
  getOrdersByDateRange,
  getOrdersByShop,
  ultimateSearch,
  updateOrder,
  updateOrderStatus,
} from "../controllers/order.controller";
import { isAdminOrManager, isAuthenticated, verifyToken } from "../middleware";

const orderRouter: Router = express.Router();

//* GET Route
orderRouter.get("/all", verifyToken, isAuthenticated, getAllOrders);
orderRouter.get("/get/:orderId", verifyToken, isAuthenticated, getOrderById);
orderRouter.get("/shop/:shop", verifyToken, isAuthenticated, getOrdersByShop);
orderRouter.get(
  "/search/:searchTerm",
  verifyToken,
  isAuthenticated,
  ultimateSearch
);
orderRouter.get(
  "/date-range",
  verifyToken,
  isAuthenticated,
  getOrdersByDateRange
);

//* PUT Route
orderRouter.put("/update/:orderId",verifyToken, isAuthenticated, updateOrder);
orderRouter.put("/update/status",verifyToken, isAuthenticated, updateOrderStatus);

//* POST Route
orderRouter.post("/create", verifyToken, isAuthenticated, createOrder);

//* DELETE Route
orderRouter.delete(
  "/delete/:_id",
  verifyToken,
  isAdminOrManager,
  deleteOrderById
);

export default orderRouter;
