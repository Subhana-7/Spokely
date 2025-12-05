import { IDailyTask } from "../models/daily.task.model";
import { DailyTaskDto } from "../dto/daily.task.dto";

export function mapDailyTaskToDto(task: IDailyTask): DailyTaskDto {
  const user = task.userId as any; // because populated

  return {
    id: task._id.toString(),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    topic: task.topic,
    taskDate: task.taskDate,
    writing: task.writing,
    reading: task.reading,
    speaking: task.speaking,
    listening: task.listening,
    createdAt: task.createdAt,
  };
}

