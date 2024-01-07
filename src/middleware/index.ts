require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { AuthenticatedRequest } from "../types";
const jwt = require("jsonwebtoken");

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ error: "Unauthorized: Missing token" });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_TOKEN_KEY,
    (err: any, decoded: JwtPayload | undefined) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      if (decoded) {
        // Ensure req.user is an object before assigning properties
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
          shops: decoded.shop,
        };

        next();
      } else {
        res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      }
    }
  );
};

export const isAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user) {
    // If user is present, they are authenticated
    next();
  } else {
    // If user is not present, send unauthorized status
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === "Admin") {
    // If user is present, they are authenticated
    next();
  } else {
    // If user is not present, send unauthorized status
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const isManager = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === "Manager") {
    // If user is present, they are authenticated
    next();
  } else {
    // If user is not present, send unauthorized status
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const isAdminOrManager = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === "Admin" || req.user?.role === "Manager") {
    // If user is present, they are authenticated
    next();
  } else {
    // If user is not present, send unauthorized status
    res.status(401).json({ error: "Unauthorized" });
  }
};
