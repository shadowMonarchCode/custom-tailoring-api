import { Request, Response } from "express";
import Order, { IOrder } from "../models/order.model";
import Customer, { ICustomer } from "../models/customer.model";
import User, { IUser } from "../models/user.model";
import mongoose from "mongoose";
import { UserRequest } from "../types";

// Get all orders
export const getAllOrders = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role } = req.user!;

    let orders: IOrder[] | null;

    if (role === "Manager" || role === "User") {
      const manager: IUser | null = await User.findById(userId);
      const shops = manager?.shop || [];
      orders = await Order.find({ shop: { $in: shops } }).populate([
        {
          path: "customerId",
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
          path: "customerId",
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
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const _id = req.params.orderId;
    const { userId, role } = req.user!;

    // Validate request parameter
    if (!_id) {
      res.status(400).json({ error: "Order ID parameter is required" });
      return;
    }

    // Find order by custom ID
    const order: IOrder | null = await Order.findById(_id).populate({
      path: "customerId",
      select: "name phone",
    });

    if (!order) {
      res.status(404).json({ error: "Order not found with the specified ID" });
      return;
    }

    // Check if shop matches them manager
    if (role === "Manager") {
      const manager: IUser | null = await User.findById(userId);
      if (!manager?.shop.includes(order.shop)) {
        res
          .status(401)
          .json({ error: "Unauthorized: You can't access this order." });
        return;
      }
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// All orders of a specific shop
export const getOrdersByShop = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const shop = req.params.shop;
    const { userId, role } = req.user!;

    // Validate request parameter
    if (!shop) {
      res.status(400).json({ error: "Shop number parameter is required" });
      return;
    }

    if (role === "Manager" || role === "User") {
      const manager = await User.findById(userId);
      const shops = manager?.shop || [];

      if (!shops.includes(shop)) {
        res.status(401).json({
          error: "Unauthorized: You can not view this shop's orders.",
        });
      }
    }

    // Find orders by shop
    let orders: IOrder[] | null = await Order.find({ shop }).populate({
      path: "customerId",
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
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const searchTerm = req.params.searchTerm;
    const { userId, role } = req.user!;

    // Validate request parameter
    if (!searchTerm) {
      res.status(400).json({ error: "Search term parameter is required" });
      return;
    }

    let customerOrders: IOrder[] | null = [];
    let orderSearch: IOrder[] | null = [];

    // For users and managers
    if (role === "User" || role === "Manager") {
      const user = await User.findById(userId);
      const shops = user?.shop || [];

      const customerSearch: ICustomer[] | null = await Customer.find({
        $or: [
          { name: { $regex: new RegExp(searchTerm, "i") } },
          { phone: { $regex: new RegExp(searchTerm, "i") } },
        ],
      });

      if (customerSearch) {
        const customerIds: string[] =
          customerSearch.map((customer) => customer._id) || [];
        if (role === "User") {
          customerOrders = await Order.find({
            customerId: { $in: customerIds },
            creator: userId,
          }).populate([
            {
              path: "customerId",
              select: "name phone",
            },
            {
              path: "creator",
              select: "name",
            },
          ]);
        } else if (role === "Manager") {
          customerOrders = await Order.find({
            customerId: { $in: customerIds },
            shop: { $in: shops },
          }).populate([
            {
              path: "customerId",
              select: "name phone",
            },
            {
              path: "creator",
              select: "name",
            },
          ]);
        }
      }

      // Search for orders by order ID
      orderSearch = await Order.find({
        $or: [
          { orderNum: { $regex: new RegExp(searchTerm, "i") } },
          { billNum: { $regex: new RegExp(searchTerm, "i") } },
        ],
        shop: { $in: shops },
      }).populate([
        {
          path: "customerId",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    } else {
      //For *ADMIN*
      // Search in customer's list
      const customerSearch: ICustomer[] | null = await Customer.find({
        $or: [
          { name: { $regex: new RegExp(searchTerm, "i") } },
          { phone: { $regex: new RegExp(searchTerm, "i") } },
        ],
      });
      // Get customer Ids and get their orders
      const customerIds: string[] =
        customerSearch.map((customer) => customer._id) || [];
      customerOrders = await Order.find({
        customerId: { $in: customerIds },
      }).populate([
        {
          path: "customerId",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name role",
        },
      ]);
      // Search in order's list
      orderSearch = await Order.find({
        $or: [
          { orderNum: { $regex: new RegExp(searchTerm, "i") } },
          { billNum: { $regex: new RegExp(searchTerm, "i") } },
        ],
      }).populate([
        {
          path: "customerId",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    }

    // Combine all orders found
    const allOrders: IOrder[] = [...customerOrders, ...orderSearch];

    if (allOrders.length === 0) {
      res.status(404).json({
        error: "No customers or orders found with the specified search term",
      });
      return;
    }

    res.json(allOrders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Get orders within a date range
export const getOrdersByDateRange = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    let { startDate, endDate } = req.body;
    const { userId, role } = req.user!;

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
      const manager = await User.findById(userId);
      const shops = manager?.shop || [];
      orders = await Order.find({
        orderDate: { $gte: startDate, $lte: endDate },
        shop: { $in: shops },
      }).populate([
        {
          path: "customerId",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    } else {
      orders = await Order.find({
        orderDate: { $gte: startDate, $lte: endDate },
      }).populate([
        {
          path: "customerId",
          select: "name phone",
        },
        {
          path: "creator",
          select: "name",
        },
      ]);
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Update order using order ID
export const updateOrder = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role } = req.user!;
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
      const user = await User.findById(userId);
      const shops = user?.shop || [];

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
      path: "customerId",
      select: "name phone",
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Update status of order
export const updateOrderStatus = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role } = req.user!;
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
      const user = await User.findById(userId);
      const shops = user?.shop || [];

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
      path: "customerId",
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
  req: UserRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, role } = req.user!;

    const {
      orderNum,
      orderDate,
      trialDate,
      deliveryDate,
      name,
      phone,
      products,
      status,
      measurements,
      shop,
    } = req.body;

    // Validate request body
    if (
      !orderNum ||
      !orderDate ||
      !trialDate ||
      !deliveryDate ||
      !name ||
      !phone ||
      !products ||
      !status ||
      !measurements ||
      !shop
    ) {
      res
        .status(400)
        .json({ error: "Missing required fields in the request body" });
      return;
    }

    // Check if any order with same order number and shop exists.
    let order: IOrder | null = await Order.findOne({
      $and: [{ orderNum }, { shop }],
    });
    if (order) {
      res.status(403).json({ error: "Order already exist." });
      return;
    }

    const user: IUser | null = await User.findById(userId);
    if (role !== "Admin" && !user?.shop.includes(shop)) {
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

    const customerId = customer._id;

    // Create a new order using the customer ID
    const newOrder = new Order({
      orderNum,
      orderDate,
      customerId,
      products,
      trialDate,
      deliveryDate,
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
  req: UserRequest,
  res: Response
): Promise<void> => {
  const _id = req.params._id;
  const { userId, role } = req.user!;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Find the order to get related user and customer information
    const orderToDelete: IOrder | null = await Order.findById(_id);

    if (!orderToDelete) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    if (role === "Manager") {
      const manager: IUser | null = await User.findById(userId);

      if (!manager?.shop.includes(orderToDelete.shop)) {
        await session.abortTransaction();
        res.status(401).json({
          error: "Unauthorized: This order does not belong to you shop.",
        });
      }
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
        { _id: orderToDelete.customerId },
        {
          $pullAll: {
            orders: [orderToDelete._id],
          },
        }
      );

      // Delete the order
      await Order.findByIdAndDelete(_id);

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
