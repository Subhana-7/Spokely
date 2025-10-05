import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IDailyTaskRepository } from "../repositories/interfaces/IDailyTaskRepository";
import {
  CreateDailyTaskDto,
  DailyTaskDto,
  TaskDetailDto,
} from "../dto/daily.task.dto";
import { mapDailyTaskToDto } from "../mappers/daily.task.mapper";
import { chatWithGroq } from "../config/groq.client";
import { Types } from "mongoose";
import userModel from "../models/user.model";

@injectable()
export class DailyTaskService {
  constructor(
    @inject(TYPES.IDailyTaskRepository)
    private readonly _dailyTaskRepository: IDailyTaskRepository
  ) {}

  private async generateTaskDetail(
    topic: string,
    type: "writing" | "reading" | "speaking" | "listening",
    level: number
  ): Promise<TaskDetailDto> {
    let levelHint = "";
    if (level <= 1) levelHint = "Keep it very simple, max 1–2 lines.";
    else if (level === 2) levelHint = "Slightly more detailed but still concise.";
    else levelHint = "Give a more challenging but short task.";

    let prompt = "";

    if (type === "writing" || type === "speaking") {
      prompt = `
        Generate a ${type} task for topic "${topic}".
        Difficulty: Level ${level}.
        Instruction: ${levelHint}.
        Output JSON ONLY:
        {
          "prompt": "short question or instruction (1–2 lines max)"
        }
      `;
    } else {
      prompt = `
        Generate a ${type} task for topic "${topic}".
        Difficulty: Level ${level}.
        Provide a short paragraph (10-12 sentences) and exactly 5 short questions (MCQ or True/False).
        Output JSON ONLY:
        {
          "prompt": "short task instruction",
          "paragraph": "short paragraph text",
          "questions": ["Q1...", "Q2...", "Q3...", "Q4...", "Q5..."]
        }
      `;
    }

    const aiContent = await chatWithGroq(prompt);

    try {
      return JSON.parse(aiContent ?? "{}");
    } catch (err) {
      console.error(`AI JSON parse error for ${type}:`, err, aiContent);
      return { prompt: aiContent ?? "" };
    }
  }

  async createDailyTask(dto: CreateDailyTaskDto): Promise<DailyTaskDto> {
    const today = new Date();
    let existing = await this._dailyTaskRepository.findByUserAndDate(
      dto.userId,
      today
    );
    if (existing) return mapDailyTaskToDto(existing);

    const user = await userModel.findById(dto.userId);
    const level = user?.levels ?? 1;

    const writing = await this.generateTaskDetail(dto.topic, "writing", level);
    const reading = await this.generateTaskDetail(dto.topic, "reading", level);
    const speaking = await this.generateTaskDetail(dto.topic, "speaking", level);
    const listening = await this.generateTaskDetail(dto.topic, "listening", level);

    const task = await this._dailyTaskRepository.create({
      userId: new Types.ObjectId(dto.userId),
      topic: dto.topic,
      taskDate: today,
      writing,
      reading,
      speaking,
      listening,
    });

    return mapDailyTaskToDto(task!);
  }

  async addUserResponse(
    taskId: string,
    type: "writing" | "reading" | "speaking" | "listening",
    userResponse: string
  ): Promise<DailyTaskDto | null> {
    const task = await this._dailyTaskRepository.findById(taskId);
    if (!task) return null;

    const prompt = `Give constructive feedback on user's ${type} response: "${userResponse}"`;
    const aiFeedback = await chatWithGroq(prompt);

    task[type].userResponse = userResponse;
    task[type].aiFeedback = aiFeedback ?? "";

    await task.save();

    return mapDailyTaskToDto(task);
  }

  async submitAll(taskId: string, responses: any, userId: string) {
    const task = await this._dailyTaskRepository.findById(taskId);
    if (!task) return null;

    // attach user responses
    for (const type of ["writing", "reading", "speaking", "listening"]) {
      if (responses[type]) {
        task[type].userResponse = responses[type];
      }
    }
    await task.save();

    // update user level progression
    const user = await userModel.findById(userId);
    if (user) {
      user.completionRate = (user.completionRate ?? 0) + 1;
      if (user.completionRate % 5 === 0) {
        user.levels = (user.levels ?? 0) + 1;
      }
      await user.save();
    }

    return mapDailyTaskToDto(task);
  }
}
