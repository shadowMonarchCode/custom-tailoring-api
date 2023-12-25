import { Response } from "express";
import Order, { IOrder } from "../models/order.model";
import Customer, { ICustomer } from "../models/customer.model";
import User, { IUser } from "../models/user.model";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../types";

// Get all orders
export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role, shops } = req.user!;

    let orders: IOrder[] | null;

    if (role === "Manager" || role === "User") {
      orders = await Order.find({ shop: { $in: shops } }).populate([
        {
          path: "customer",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    } else if (role === "Admin") {
      orders = await Order.find().populate([
        {
          path: "customer",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    } else {
      orders = [];
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Get order by order ID
export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const _id = req.params.orderId;
    const { userId, role, shops } = req.user!;

    // Validate request parameter
    if (!_id) {
      res.status(400).json({ error: "Order ID parameter is required" });
      return;
    }

    // Find order by ID
    const order: IOrder | null = await Order.findById(_id).populate({
      path: "customer",
      select: "name phone",
    });

    if (!order) {
      res.status(404).json({ error: "Order not found with the specified ID" });
      return;
    }

    // Check if shop matches them manager
    if (role === "Manager" && shops.includes(order.shop)) {
      res
        .status(401)
        .json({ error: "Unauthorized: You can't access this order." });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// All orders of a specific shop
export const getOrdersByShop = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const shop = req.params.shop;
    const { userId, role, shops } = req.user!;

    // Validate request parameter
    if (!shop) {
      res.status(400).json({ error: "Shop number parameter is required" });
      return;
    }

    if (role === "Manager" || role === "User") {
      if (!shops.includes(shop)) {
        res.status(401).json({
          error: "Unauthorized: You can not view this shop's orders.",
        });
        return;
      }
    }

    // Find orders by shop
    const orders: IOrder[] | null = await Order.find({ shop }).populate({
      path: "customer",
      select: "name phone",
    });

    if (orders.length === 0) {
      res.status(404).json({ error: "No orders found for the specified shop" });
      return;
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Ultimate Search Algorithm
export const ultimateSearch = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const searchTerm = req.params.searchTerm;
    const { userId, role, shops } = req.user!;

    // Validate request parameter
    if (!searchTerm) {
      res.status(400).json({ error: "Search term parameter is required" });
      return;
    }

    let orders: IOrder[] | null;

    if (role === "Admin") {
      orders = await Order.find({
        $or: [
          { "customer.name": { $regex: new RegExp(searchTerm, "i") } },
          { "customer.phone": { $regex: new RegExp(searchTerm, "i") } },
          { order: { $regex: new RegExp(searchTerm, "i") } },
          { bill: { $regex: new RegExp(searchTerm, "i") } },
        ],
      }).populate([
        {
          path: "customer",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    } else if (role === "Manager" || role === "User") {
      orders = await Order.find({
        $or: [
          { "customer.name": { $regex: new RegExp(searchTerm, "i") } },
          { "customer.phone": { $regex: new RegExp(searchTerm, "i") } },
          { order: { $regex: new RegExp(searchTerm, "i") } },
          { bill: { $regex: new RegExp(searchTerm, "i") } },
        ],
        shop: { $in: shops },
      }).populate([
        {
          path: "customer",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    } else {
      orders = [];
    }

    if (orders.length === 0) {
      res.status(404).json({
        error: "No customers or orders found with the specified search term",
      });
      return;
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Get orders within a date range
export const getOrdersByDateRange = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    let { startDate, endDate } = req.body;
    const { userId, role, shops } = req.user!;

    if (!startDate) {
      res.status(400).json({ error: "Missing starting date!" });
      return;
    } else {
      startDate = new Date(startDate);
    }
    if (!endDate) {
      endDate = new Date();
    }

    let orders: IOrder[] | null;
    if (role === "Manager" || role === "User") {
      orders = await Order.find({
        orderDate: { $gte: startDate, $lte: endDate },
        shop: { $in: shops },
      }).populate([
        {
          path: "customer",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    } else if (role === "Admin") {
      orders = await Order.find({
        orderDate: { $gte: startDate, $lte: endDate },
      }).populate([
        {
          path: "customer",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    } else {
      orders = [];
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//TODO: Update order using order ID
export const updateOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role, shops } = req.user!;
    const orderId = req.params.orderId;
    const updatedFields = req.body;

    // Validate request parameters
    if (!orderId) {
      res.status(400).json({ error: "Order ID parameter is required" });
      return;
    }

    // Validate request body
    if (Object.keys(updatedFields).length === 0) {
      res
        .status(400)
        .json({ error: "No fields to update provided in the request body" });
      return;
    }

    const oldOrder: IOrder | null = await Order.findById(orderId);
    if (!oldOrder) {
      res.status(404).json({ error: "Order not found with the specified ID" });
      return;
    }

    if (role === "Manager" || role === "User") {
      if (role === "User" && oldOrder.creator !== userId) {
        res
          .status(401)
          .json({ error: "Unauthorised: You can not edit this order." });
        return;
      }

      if (!shops.includes(oldOrder.shop)) {
        res
          .status(401)
          .json({ error: "Unauthorised: You can not edit this order." });
        return;
      }
    }

    // Find and update order by ID
    const updatedOrder: IOrder | null = await Order.findByIdAndUpdate(
      orderId,
      updatedFields,
      {
        new: true,
      }
    ).populate({
      path: "customer",
      select: "name phone",
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//TODO: Update status of order
export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role, shops } = req.user!;
    const orderId = req.params.orderId;
    const newStatus = req.body.status;

    // Validate request parameters
    if (!orderId) {
      res.status(400).json({ error: "Order ID parameter is required" });
      return;
    }

    // Validate request body
    if (!newStatus) {
      res
        .status(400)
        .json({ error: "Status field is required in the request body" });
      return;
    }

    const order: IOrder | null = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ error: "No order with the given order number." });
      return;
    }

    if (role === "Manager" || role === "User") {
      if (role === "User" && order.creator !== userId) {
        res
          .status(401)
          .json({ error: "Unauthorised: You can not edit this order." });
        return;
      }

      if (!shops.includes(order.shop)) {
        res
          .status(401)
          .json({ error: "Unauthorised: You can not edit this order." });
        return;
      }
    }

    // Find and update order status by ID
    const updatedOrder: IOrder | null = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    ).populate({
      path: "customer",
      select: "name phone",
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Create order
export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, role, shops } = req.user!;

    const { order, dates, name, phone, products, status, shop, measurements } =
      req.body;

    // Validate request body
    if (
      !order ||
      !dates ||
      !name ||
      !phone ||
      !products ||
      !status ||
      !shop ||
      !measurements
    ) {
      res
        .status(400)
        .json({ error: "Missing required fields in the request body" });
      return;
    }

    // Check if any order with same order number and shop exists.
    const existingOrder: IOrder | null = await Order.findOne({
      $and: [{ order }, { shop }],
    });
    if (existingOrder) {
      res.status(403).json({ error: "Order already exist." });
      return;
    }

    if (role !== "Admin" && shops.includes(shop)) {
      res
        .status(401)
        .json({ error: "Unauthorised: You can not add order for this shop." });
    }

    // Check if the customer with the given phone number exists
    let customer: ICustomer | null = await Customer.findOne({ phone });

    // If the customer doesn't exist, create a new customer
    if (!customer) {
      const newCustomer = new Customer({ name, phone });
      customer = await newCustomer.save();
    }

    // Create a new order using the customer ID
    const newOrder = new Order({
      order,
      dates,
      customer: customer._id,
      products,
      status,
      shop,
      measurements,
      creator: userId,
    });

    // Save the new order
    const savedOrder: IOrder = await newOrder.save();

    // Save order ID and update measurements in user
    customer.orders.push(savedOrder._id);
    customer.measurements = measurements;
    await customer.save();

    // Save order ID in user
    let user: IUser | null = await User.findById(userId);
    if (user) {
      user.orders.push(savedOrder._id);
      await user.save();
    }

    // Commit the transaction
    await session.commitTransaction();

    res.status(201).json(savedOrder);
  } catch (error) {
    // Abort the transaction if an error occurs
    await session.abortTransaction();
    console.error(error);
    res.status(500).send("Internal Server Error");
  } finally {
    session.endSession();
  }
};

// Delete order by ID
export const deleteOrderById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const orderId = req.params._id;
  const { userId, role, shops } = req.user!;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Find the order to get related user and customer information
    const orderToDelete: IOrder | null = await Order.findById(orderId);

    if (!orderToDelete) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    if (role === "Manager" && shops.includes(orderToDelete.shop)) {
      await session.abortTransaction();
      res.status(401).json({
        error: "Unauthorized: This order does not belong to you shop.",
      });
      return;
    }

    try {
      // Remove the order ID from the user's orders array
      await User.findByIdAndUpdate(
        { _id: orderToDelete.creator },
        {
          $pullAll: {
            orders: [orderToDelete._id],
          },
        }
      );

      // Remove the order ID from the customer's orders array
      await Customer.findByIdAndUpdate(
        { _id: orderToDelete.customer },
        {
          $pullAll: {
            orders: [orderToDelete._id],
          },
        }
      );

      // Delete the order
      await Order.findByIdAndDelete(orderId);

      // Commit the transaction
      await session.commitTransaction();

      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    res.status(500).send("Internal Server Error");
  } finally {
    session.endSession();
  }
};
