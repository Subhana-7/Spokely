import { Types } from "mongoose";
import { TaskDetailDto } from "../../dto/daily.task.dto";
import { IDailyTask } from "../../models/daily.task.model";

export interface IDailyTaskRepository {
  findById(taskId: string): Promise<IDailyTask | null>;
  create(data: Partial<IDailyTask>): Promise<IDailyTask | null>;
  findByUserAndDate(userId: string, taskDate: Date): Promise<IDailyTask | null>;
}

