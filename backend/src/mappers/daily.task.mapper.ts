import { IDailyTask } from "../models/daily.task.model";
import { DailyTaskDto } from "../dto/daily.task.dto";

export function mapDailyTaskToDto(task: IDailyTask): DailyTaskDto {
  const user = task.userId as any;

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
      feedback: task.writing.feedback,
    },
    reading: {
      prompt: task.reading.prompt,
      paragraph: task.reading.paragraph,
      questions: task.reading.questions,
      userResponse: task.reading.userResponse,
      feedback: task.reading.feedback,
    },
    speaking: {
      prompt: task.speaking.prompt,
      questions: task.speaking.questions,
      userResponse: task.speaking.userResponse,
      feedback: task.speaking.feedback,
    },
    listening: {
      prompt: task.listening.prompt,
      paragraph: task.listening.paragraph,
      questions: task.listening.questions,
      userResponse: task.listening.userResponse,
      feedback: task.listening.feedback,
    },
    createdAt: task.createdAt,
  };
}
