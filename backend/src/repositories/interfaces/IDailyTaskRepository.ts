import { Types } from "mongoose";
import { TaskDetailDto } from "../../dto/daily.task.dto";
import { IDailyTask } from "../../models/daily.task.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IDailyTaskRepository extends IBaseRepository<IDailyTask> {
  findById(taskId: string): Promise<any>;
  create(data: Partial<IDailyTask>): Promise<IDailyTask | null>;
  findByUserAndDate(userId: string, taskDate: Date): Promise<IDailyTask | null>;

  findAllByDate(date: Date): Promise<IDailyTask[]>;

  countByUser(userId: string): Promise<number>
}
