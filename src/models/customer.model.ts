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
  shirt: IShirt;
  trouser: ITrouser;
  jacket: IJacket;
}

export interface ICustomer extends Document {
  name: string;
  phone: string;
  orders: string[];
  measurements: IMeasurement;
}

const shirtSchema = new Schema({
  shoulder: { type: Number, default: 0.0 },
  sleeveLength: { type: Number, default: 0.0 },
  chest: { type: Number, default: 0.0 },
  waist: { type: Number, default: 0.0 },
  hip: { type: Number, default: 0.0 },
  neck: { type: Number, default: 0.0 },
});

const trouserSchema = new Schema({
  length: { type: Number, default: 0.0 },
  crotch: { type: Number, default: 0.0 },
  waist: { type: Number, default: 0.0 },
  hip: { type: Number, default: 0.0 },
  thigh: { type: Number, default: 0.0 },
  knee: { type: Number, default: 0.0 },
  bottom: { type: Number, default: 0.0 },
  fLow: { type: Number, default: 0.0 },
});

const jacketSchema = new Schema({
  length: { type: Number, default: 0.0 },
  shoulder: { type: Number, default: 0.0 },
  sleeveLength: { type: Number, default: 0.0 },
  chest: { type: Number, default: 0.0 },
  waist: { type: Number, default: 0.0 },
  hip: { type: Number, default: 0.0 },
  neck: { type: Number, default: 0.0 },
  crossBack: { type: Number, default: 0.0 },
});

const measurementSchema = new Schema({
  shirt: { type: shirtSchema, default: {} },
  trouser: { type: trouserSchema, default: {} },
  jacket: { type: jacketSchema, default: {} },
});

const customerSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  orders: { type: [mongoose.Schema.Types.ObjectId], ref: "Order", default: [] },
  measurements: { type: measurementSchema },
});

const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
