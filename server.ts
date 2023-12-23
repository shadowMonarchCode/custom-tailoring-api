// Imports
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./src/services/database.services";
import userRouter from "./src/routes/user.router";
import orderRouter from "./src/routes/order.router";
import customerRouter from "./src/routes/customer.router";

// Constants
const app = express();
const port = process.env.PORT || 8000;

// const options: cors.CorsOptions = {
//   origin: ["http://localhost:5173"],
// };

app.use(express.json());
app.use(cors());

// Database Connection
connectToDatabase()
  .then(() => {
    console.log("Database connected!"); //* Connection Successful
  })
  .catch((error) => {
    console.log("Database not connected!", error); //! Connection failure
  });

// User Routes
app.use("/user", userRouter);

// Order Routes
app.use("/order", orderRouter);

// Customer Routes
app.use("/customer", customerRouter);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
