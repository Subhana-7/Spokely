import { CreateDailyTaskDto, DailyTaskDto } from "../../dto/daily.task.dto";

export interface IDailyTaskService {
  createDailyTask(dto: CreateDailyTaskDto): Promise<DailyTaskDto>;
  addUserResponse(
    taskId: string,
    type: "writing" | "reading" | "speaking" | "listening",
    userResponse: string
  ): Promise<DailyTaskDto | null>;
  submitAll(
    taskId: string,
    responses: any,
    userId: string
  ): Promise<DailyTaskDto | null>;
  getUserLatestTask(userId: string): Promise<DailyTaskDto | null>;

  getAllUsersLatestTasks(): Promise<DailyTaskDto[]>;
  getDailyTaskById(dailyTaskId:string):Promise<any>;
}
