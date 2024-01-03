import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    shops: string[];
  };
}

export type IMeasurements = {
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
};

export type INewOrder = {
  order: string;
  creator: string;
  status: string;
  shop: string;
  dates: {
    order: Date;
    trial: Date;
    delivery: Date;
  };
  customer: {
    name: string;
    phone: string;
  };
  products: {
    product: string;
    quantity: number;
  }[];
  measurements: IMeasurements;
};