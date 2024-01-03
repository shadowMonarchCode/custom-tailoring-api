import mongoose, { Document, Schema } from "mongoose";

interface IMeasurements {
  shirt?: {
    length: number;
    shoulder: number;
    sleeveLength: number;
    chest: number;
    waist: number;
    hip: number;
    neck: number;
    remark?: string;
  };
  trouser?: {
    length: number;
    crotch: number;
    waist: number;
    hip: number;
    thigh: number;
    knee: number;
    bottom: number;
    fLow: number;
    remark?: string;
  };
  jacket?: {
    length: number;
    shoulder: number;
    sleeveLength: number;
    chest: number;
    waist: number;
    hip: number;
    neck: number;
    crossBack: number;
    remark?: string;
  };
}

interface Dates {
  order: Date;
  trial: Date;
  delivery: Date;
  completion?: Date;
  cancelled?: Date;
}

export interface IOrder extends Document {
  order: string;
  dates: Dates;
  customer: string;
  products: {
    product: string;
    quantity: number;
  }[];
  status: string;
  shop: string;
  bill?: string;
  measurements: IMeasurements;
  creator: string;
}

const datesSchema = new mongoose.Schema({
  order: { type: Date, required: true },
  trial: { type: Date, required: true },
  delivery: { type: Date, required: true },
  completion: { type: Date },
  cancelled: { type: Date },
});

const shirtSchema = new mongoose.Schema({
  length: { type: Number, required: true },
  shoulder: { type: Number, required: true },
  sleeveLength: { type: Number, required: true },
  chest: { type: Number, required: true },
  waist: { type: Number, required: true },
  hip: { type: Number, required: true },
  neck: { type: Number, required: true },
  remark: { type: String },
});

const trouserSchema = new mongoose.Schema({
  length: { type: Number, required: true },
  crotch: { type: Number, required: true },
  waist: { type: Number, required: true },
  hip: { type: Number, required: true },
  thigh: { type: Number, required: true },
  knee: { type: Number, required: true },
  bottom: { type: Number, required: true },
  fLow: { type: Number, required: true },
  remark: { type: String },
});

const jacketSchema = new mongoose.Schema({
  length: { type: Number, required: true },
  shoulder: { type: Number, required: true },
  sleeveLength: { type: Number, required: true },
  chest: { type: Number, required: true },
  waist: { type: Number, required: true },
  hip: { type: Number, required: true },
  neck: { type: Number, required: true },
  crossBack: { type: Number, required: true },
  remark: { type: String },
});

const measurementsSchema = new mongoose.Schema({
  shirt: shirtSchema,
  trouser: trouserSchema,
  jacket: jacketSchema,
});

const productSchema = new Schema({
  product: {
    type: String,
    required: true,
  },
  quantity: { type: Number, default: 1 },
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
    enum: ["Pending", "Trial", "Finished", "Completed", "Cancelled"],
  },
  shop: { type: String, required: true },
  bill: { type: String },
  measurements: { type: measurementsSchema },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

orderSchema.index({ shop: 1, order: 1 }, { unique: true });

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
