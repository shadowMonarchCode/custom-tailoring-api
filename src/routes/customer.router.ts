import express, { Router } from "express";
import {
  getAllCustomers,
  getCustomerByPhoneOrName,
  getCustomerDetails,
} from "../controllers/customer.controller";
import { isAdminOrManager, isAuthenticated, verifyToken } from "../middleware";

const customerRouter: Router = express.Router();

//* GET Route
customerRouter.get(
  "/get/:customerId",
  verifyToken,
  isAuthenticated,
  getCustomerDetails
);
customerRouter.get("/all", verifyToken, isAdminOrManager, getAllCustomers);
customerRouter.get(
  "/search/:searchTerm",
  verifyToken,
  isAdminOrManager,
  getCustomerByPhoneOrName
);

// * PUT Route

// * POST Route

//* DELETE Route
// customerRouter.get("/delete/:customerId");

export default customerRouter;
