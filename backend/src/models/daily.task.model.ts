import mongoose, { Document, model, Schema } from "mongoose";

interface TaskDetail {
  prompt: string;
  paragraph?: string;
  questions?: string[];
  userResponse?: string;
}

export interface IDailyTask extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  date: Date;
  writing: TaskDetail;
  reading: TaskDetail;
  speaking: TaskDetail;
  listening: TaskDetail;
}

const TaskDetailSchema = new Schema<TaskDetail>(
  {
    prompt: { type: String, required: true },
    paragraph: { type: String },
    questions: [{ type: String }],
    userResponse: { type: String },
  },
  { _id: false }
);

const DailyTaskSchema = new Schema<IDailyTask>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  date: { type: Date, default: Date.now },
  writing: { type: TaskDetailSchema, required: true },
  reading: { type: TaskDetailSchema, required: true },
  speaking: { type: TaskDetailSchema, required: true },
  listening: { type: TaskDetailSchema, required: true },
});

export const DailyTaskModel = model<IDailyTask>("DailyTask", DailyTaskSchema);
