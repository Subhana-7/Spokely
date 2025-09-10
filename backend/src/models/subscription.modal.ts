import { Schema, model, Types, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  mentorId: Types.ObjectId;
  plan: "DAILY" | "WEEKLY" | "BIWEEKLY" | "TRIWEEKLY";
  price: number;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: "Mentor", required: true },
    plan: {
      type: String,
      enum: ["DAILY", "WEEKLY", "BIWEEKLY", "TRIWEEKLY"],
      required: true,
    },
    price: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "EXPIRED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default model<ISubscription>("Subscription", subscriptionSchema);
