import { Schema, model, Types, Document } from "mongoose";

export interface IMentorPlan extends Document {
  mentorId: Types.ObjectId;
  plans: {
    type: "DAILY" | "WEEKLY" | "BIWEEKLY" | "TRIWEEKLY";
    price: number;
    time: number; 
  }[];
}

const mentorPlanSchema = new Schema<IMentorPlan>(
  {
    mentorId: { type: Schema.Types.ObjectId, ref: "Mentor", required: true },
    plans: [
      {
        type: {
          type: String,
          enum: ["DAILY", "WEEKLY", "BIWEEKLY", "TRIWEEKLY"],
          required: true,
        },
        price: { type: Number, required: true },
        time: { type: Number, required: true }, 
      },
    ],
  },
  { timestamps: true }
);


export default model<IMentorPlan>("MentorPlan", mentorPlanSchema);
