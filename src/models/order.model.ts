import mongoose, { Document, Schema } from "mongoose";

interface IShirt {
  shoulder: number;
  sleeveLength: number;
  chest: number;
  waist: number;
  hip: number;
  neck: number;
  remark: string;
}

interface ITrouser {
  length: number;
  crotch: number;
  waist: number;
  hip: number;
  thigh: number;
  knee: number;
  bottom: number;
  fLow: number;
  remark: string;
}

interface IJacket {
  length: number;
  shoulder: number;
  sleeveLength: number;
  chest: number;
  waist: number;
  hip: number;
  neck: number;
  crossBack: number;
  remark: string;
}

interface IProduct {
  type: string;
  amount: number;
}

interface IMeasurement {
  shirt: IShirt | null;
  trouser: ITrouser | null;
  jacket: IJacket | null;
}

interface Dates {
  order: Date;
  trial: Date;
  delivery: Date;
  completion: Date | null;
  cancelled: Date | null;
}

interface Customer {
  name: string;
  phone: string;
}

export interface IOrder extends Document {
  order: string;
  dates: Dates;
  customer: Customer | string;
  products: IProduct[];
  status: string;
  shop: string;
  bill: string;
  measurements: IMeasurement;
  creator: string;
}

const shirtSchema = new Schema({
  shoulder: { type: Number },
  sleeveLength: { type: Number },
  chest: { type: Number },
  waist: { type: Number },
  hip: { type: Number },
  neck: { type: Number },
  remark: { type: String },
});

const trouserSchema = new Schema({
  length: { type: Number },
  crotch: { type: Number },
  waist: { type: Number },
  hip: { type: Number },
  thigh: { type: Number },
  knee: { type: Number },
  bottom: { type: Number },
  fLow: { type: Number },
  remark: { type: String },
});

const jacketSchema = new Schema({
  length: { type: Number },
  shoulder: { type: Number },
  sleeveLength: { type: Number },
  chest: { type: Number },
  waist: { type: Number },
  hip: { type: Number },
  neck: { type: Number },
  crossBack: { type: Number },
  remark: { type: String },
});

const measurementSchema = new Schema({
  shirt: { type: shirtSchema, default: null },
  trouser: { type: trouserSchema, default: null },
  jacket: { type: jacketSchema, default: null },
});

const productSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "Jacket",
      "Jawar Bundi",
      "Kurta",
      "Pajama",
      "Sherwani",
      "Shirt",
      "Suit 2pc",
      "Suit 3pc",
      "Trouser",
      "Tuxedo",
      "Vest Coat",
    ],
  },
  amount: { type: Number, default: 1 },
});

const datesSchema = new Schema({
  order: { type: Date, required: true },
  trial: { type: Date, required: true },
  delivery: { type: Date, required: true },
  completion: { type: Date, default: null },
  cancellation: { type: Date, default: null },
});

const orderSchema = new Schema({
  order: { type: String, required: true },
  dates: { type: datesSchema },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  products: { type: [productSchema], required: true },
  status: {
    type: String,
    required: true,
    enum: ["Trial", "Finished", "Pending", "Completed", "Cancelled"],
  },
  shop: { type: String, required: true },
  bill: { type: String, default: "" },
  measurements: { type: measurementSchema },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

orderSchema.index({ shop: 1, order: 1 }, { unique: true });

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
