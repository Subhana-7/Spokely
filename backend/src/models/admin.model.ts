import mongoose, { Schema, Document,Types } from "mongoose";

export interface IAdmin extends Document {
  _id:Types.ObjectId;
  email: string;
  password: string;
}

const adminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.model<IAdmin>("Admin", adminSchema);
