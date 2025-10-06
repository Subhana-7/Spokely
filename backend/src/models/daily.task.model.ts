import mongoose, { Document, model, Schema } from "mongoose";

type UserResponse = string | string[] | Record<number, string>;


interface TaskDetail {
  prompt: string;
  paragraph?: string;
  questions?: string[];
  userResponse?: UserResponse;
  feedback?: string;
}

export interface IDailyTask extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  date: Date;
  writing: TaskDetail;
  reading: TaskDetail;
  speaking: TaskDetail;
  listening: TaskDetail;
  userResponses: Record<string, any>; // NEW
}

const TaskDetailSchema = new Schema<TaskDetail>(
  {
    prompt: { type: String, required: true },
    paragraph: { type: String },
    questions: [{ type: String }],
    userResponse: { type: Schema.Types.Mixed },
    feedback: {
  strengths: { type: String },
  weaknesses: { type: String },
  feedback: { type: String },
}

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
