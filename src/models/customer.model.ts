import mongoose, { Document, Schema } from "mongoose";

interface IShirt {
  shoulder: number;
  sleeveLength: number;
  chest: number;
  waist: number;
  hip: number;
  neck: number;
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
}

interface IMeasurement {
  shirt: IShirt | null;
  trouser: ITrouser | null;
  jacket: IJacket | null;
}

export interface ICustomer extends Document {
  name: string;
  phone: string;
  orders: string[];
  measurements: IMeasurement;
}

const shirtSchema = new Schema({
  shoulder: { type: Number },
  sleeveLength: { type: Number },
  chest: { type: Number },
  waist: { type: Number },
  hip: { type: Number },
  neck: { type: Number },
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
});

const measurementSchema = new Schema({
  shirt: { type: shirtSchema, default: null },
  trouser: { type: trouserSchema, default: null },
  jacket: { type: jacketSchema, default: null },
});

const customerSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  orders: { type: [mongoose.Schema.Types.ObjectId], ref: "Order", default: [] },
  measurements: { type: measurementSchema },
});

const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
