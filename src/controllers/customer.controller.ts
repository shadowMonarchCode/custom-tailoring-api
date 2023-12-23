import { Request, Response } from "express";
import Customer, { ICustomer } from "../models/customer.model";
import { UserRequest } from "../types";

// Get customer detail
export const getCustomerDetails = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.params.customerId;

    if (!customerId) {
      res.status(400).json({ error: "Customer ID is missing." });
      return;
    }

    const customer: ICustomer | null = await Customer.findById(
      customerId
    ).populate({
      path: "orders",
      select: "orderNum orderDate status products shop",
    });
    if (!customer) {
      res
        .status(404)
        .json({ error: "Customer with the specified ID does not exist." });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Get all customers
export const getAllCustomers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customers: ICustomer[] | null = await Customer.find().populate({
      path: "orders",
      select: "orderNum orderDate status products shop",
    });

    if (!customers) {
      res.status(404).json({ error: "No customer found." });
    }

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Search customer using name OR phone number
export const getCustomerByPhoneOrName = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const searchTerm = req.params.searchTerm;

    // Validate request parameter
    if (!searchTerm) {
      res.status(400).json({ error: "Search term parameter is required" });
      return;
    }

    // Use a regular expression to perform a case-insensitive search by phone or name
    const customers: ICustomer[] = await Customer.find({
      $or: [
        { phone: { $regex: new RegExp(searchTerm, "i") } },
        { name: { $regex: new RegExp(searchTerm, "i") } },
      ],
    });

    if (customers.length === 0) {
      res.status(404).json({
        error: "No customers found with the specified phone number or name",
      });
      return;
    }

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
