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

export interface IOrder extends Document {
  orderNum: string;
  orderDate: Date;
  trialDate: Date;
  deliveryDate: Date;
  completionDate: Date | null;
  cancellationDate: Date | null;
  customerId: string;
  products: IProduct[];
  status: string;
  shop: string;
  billNum: string;
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

const orderSchema = new Schema({
  orderNum: { type: String, required: true },
  orderDate: { type: Date, required: true },
  trialDate: { type: Date, required: true },
  deliveryDate: { type: Date, required: true },
  completionDate: { type: Date, default: null },
  cancellationDate: { type: Date, default: null },
  customerId: {
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
  billNum: { type: String, default: "" },
  measurements: { type: measurementSchema },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
orderSchema.index({ shop: 1, orderNum: 1 }, { unique: true });

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
