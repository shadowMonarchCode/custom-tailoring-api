import express, { Router } from "express";
import {
  bulkCreateOrders,
  createOrder,
  deleteOrderById,
  getAllMyOrders,
  getAllOrders,
  getOrderById,
  getOrdersByDateRange,
  getOrdersByShop,
  getTrialOrdersByDate,
  ultimateSearch,
  updateOrder,
  updateOrderStatus,
} from "../controllers/order.controller";
import { isAdminOrManager, isAuthenticated, verifyToken } from "../middleware";

const orderRouter: Router = express.Router();

//* GET Route
orderRouter.get("/all", verifyToken, isAuthenticated, getAllOrders);
orderRouter.get("/get/:orderId", verifyToken, isAuthenticated, getOrderById);
orderRouter.get(
  "/shop/:shopNum",
  verifyToken,
  isAuthenticated,
  getOrdersByShop
);
orderRouter.get("/my", verifyToken, isAuthenticated, getAllMyOrders);
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
orderRouter.get(
  "/trials/:date",
  verifyToken,
  isAuthenticated,
  getTrialOrdersByDate
);
orderRouter.get(
  "/deliveries/:date",
  verifyToken,
  isAuthenticated,
  getTrialOrdersByDate
);

//* PUT Route
orderRouter.put("/update/:orderId", verifyToken, isAuthenticated, updateOrder);
orderRouter.put(
  "/update-status/:orderId",
  verifyToken,
  isAuthenticated,
  updateOrderStatus
);

//* POST Route
orderRouter.post("/create", verifyToken, isAuthenticated, createOrder);
orderRouter.post("/bulk", verifyToken, isAuthenticated, bulkCreateOrders);

//* DELETE Route
orderRouter.delete(
  "/delete/:_id",
  verifyToken,
  isAdminOrManager,
  deleteOrderById
);

export default orderRouter;
