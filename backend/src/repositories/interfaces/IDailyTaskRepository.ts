import { Types } from "mongoose";
import { TaskDetailDto } from "../../dto/daily.task.dto";
import { IDailyTask } from "../../models/daily.task.model";

export interface IDailyTaskRepository {
  findById(taskId: string): Promise<IDailyTask | null>;
  create(data: {
    userId: Types.ObjectId;
    topic: string;
    taskDate: Date;
    writing: TaskDetailDto;
    reading: TaskDetailDto;
    speaking: TaskDetailDto;
    listening: TaskDetailDto;
  }): Promise<IDailyTask | null>;
  findByUserAndDate(userId: string, taskDate: Date): Promise<IDailyTask | null>;
}
