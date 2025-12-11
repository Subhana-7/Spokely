import { IDailyTask } from "../models/daily.task.model";
import { DailyTaskDto } from "../dto/daily.task.dto";

export function mapDailyTaskToDto(task: IDailyTask): DailyTaskDto {
  const user = task.userId as any; // populated user doc

  return {
    id: task._id.toString(),
    user: {
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
    },
    topic: task.topic,
    taskDate: task.date,
    writing: {
      prompt: task.writing.prompt,
      paragraph: task.writing.paragraph,
      questions: task.writing.questions,
      userResponse: task.writing.userResponse,
    },
    reading: {
      prompt: task.reading.prompt,
      paragraph: task.reading.paragraph,
      questions: task.reading.questions,
      userResponse: task.reading.userResponse,
    },
    speaking: {
      prompt: task.speaking.prompt,
      questions: task.speaking.questions,
      userResponse: task.speaking.userResponse,
    },
    listening: {
      prompt: task.listening.prompt,
      paragraph: task.listening.paragraph,
      questions: task.listening.questions,
      userResponse: task.listening.userResponse,
    },
    createdAt: task.createdAt, // now exists in interface
  };
}
