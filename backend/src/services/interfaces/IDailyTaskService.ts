import { CreateDailyTaskDto, DailyTaskDto, DailyTaskResponses } from "../../dto/daily.task.dto";

export interface IDailyTaskService {
  createDailyTask(dto: CreateDailyTaskDto): Promise<DailyTaskDto>;
  addUserResponse(
    taskId: string,
    type: "writing" | "reading" | "speaking" | "listening",
    userResponse: DailyTaskResponses
  ): Promise<DailyTaskDto | null>;
  submitAll(
    taskId: string,
    responses: DailyTaskResponses,
    userId?:string
  ): Promise<DailyTaskDto | null>;
  getUserLatestTask(userId: string): Promise<DailyTaskDto | null>;

  getAllUsersLatestTasks(): Promise<DailyTaskDto[]>;
  getDailyTaskById(dailyTaskId:string):Promise<DailyTaskDto>;
}
