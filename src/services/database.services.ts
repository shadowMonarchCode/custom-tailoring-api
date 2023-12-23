require("dotenv").config();
import mongoose from "mongoose";

export async function connectToDatabase() {
  await mongoose.connect(process.env.DB_CONN_STRING!, {
    dbName: "customTailoring"
  });

  console.log(
    `Database: ${mongoose.connection.name}`
  );
}
