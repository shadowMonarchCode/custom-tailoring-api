require("dotenv").config();
import mongoose from "mongoose";

export async function connectToDatabase() {
  const connection = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.8ukzkuu.mongodb.net/?retryWrites=true&w=majority`;
  await mongoose.connect(connection, {
    dbName: "customTailoring",
  });

  console.log(`Database: ${mongoose.connection.name}`);
}
