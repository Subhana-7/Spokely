import { IDailyTask } from "../models/daily.task.model";
import { DailyTaskDto } from "../dto/daily.task.dto";

export function mapDailyTaskToDto(task: IDailyTask): DailyTaskDto {
  return {
    id: task._id.toString(),
    userId: task.userId.toString(),
    topic: task.topic,
    taskDate: task.taskDate,
    writing: task.writing,
    reading: task.reading,
    speaking: task.speaking,
    listening: task.listening,
    createdAt: task.createdAt,
  };
}
