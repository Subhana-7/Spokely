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
    else if (level === 2)
      levelHint = "Slightly more detailed but still concise.";
    else levelHint = "Give a more challenging but short task.";

    let prompt = "";

    if (type === "writing" || type === "speaking") {
      prompt = `
        Generate a ${type} task for topic "${topic}".
        Difficulty: Level ${level}.
        Instruction: ${levelHint}.
        Output JSON ONLY (no markdown, no backticks):
        {
          "prompt": "short question or instruction (1–2 lines max)"
        }
      `;
    } else {
      prompt = `
        Generate a ${type} task for topic "${topic}".
        Difficulty: Level ${level}.
        Provide a short paragraph (10-12 sentences) and exactly 5 short questions.
        Output JSON ONLY (no markdown, no backticks):
        {
          "prompt": "short task instruction",
          "paragraph": "short paragraph text",
          "questions": ["Q1...", "Q2...", "Q3...", "Q4...", "Q5..."]
        }
      `;
    }

    const aiContent = await chatWithGroq(prompt);

    try {
      const cleaned = aiContent
        ?.replace(/```(json)?/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(cleaned ?? "{}");
    } catch (err) {
      console.error(`AI JSON parse error for ${type}:`, err, aiContent);
      return { prompt: aiContent ?? "" };
    }
  }

  async createDailyTask(dto: CreateDailyTaskDto): Promise<DailyTaskDto> {
    const today = new Date();
    const dayStart = new Date(today.setHours(0, 0, 0, 0));

    let task = await this._dailyTaskRepository.findByUserAndDate(
      dto.userId,
      dayStart
    );

    const user = await userModel.findById(dto.userId);
    const level = user?.levels ?? 1;

    const writing = await this.generateTaskDetail(dto.topic, "writing", level);
    const reading = await this.generateTaskDetail(dto.topic, "reading", level);
    const speaking = await this.generateTaskDetail(
      dto.topic,
      "speaking",
      level
    );
    const listening = await this.generateTaskDetail(
      dto.topic,
      "listening",
      level
    );

    if (task) {
      task.topic = dto.topic;
      task.writing = writing;
      task.reading = reading;
      task.speaking = speaking;
      task.listening = listening;
      task.userResponses = {};
      await task.save();
    } else {
      task = await this._dailyTaskRepository.create({
        userId: new Types.ObjectId(dto.userId),
        topic: dto.topic,
        date: dayStart,
        writing,
        reading,
        speaking,
        listening,
        userResponses: {},
      });
    }

    return mapDailyTaskToDto(task!);
  }

  async submitAll(taskId: string, responses: any, userId: string) {
    const task = await this._dailyTaskRepository.findById(taskId);
    if (!task) return null;

    if (responses.writing) task.writing.userResponse = responses.writing;
    if (responses.speaking) task.speaking.userResponse = responses.speaking;
    if (responses.reading) task.reading.userResponse = responses.reading;
    if (responses.listening) task.listening.userResponse = responses.listening;

    await task.save();

    const evalPrompt = `
  You are an Communication Trainer. Evaluate the following student task responses.
  Provide strengths, weaknesses, and specific improvement tips.
  
  Writing:
  Prompt: ${task.writing.prompt}
  Student: ${task.writing.userResponse}

  Reading:
  Paragraph: ${task.reading.paragraph}
  Questions: ${JSON.stringify(task.reading.questions)}
  Answers: ${JSON.stringify(task.reading.userResponse)}

  Listening:
  Paragraph: ${task.listening.paragraph}
  Questions: ${JSON.stringify(task.listening.questions)}
  Answers: ${JSON.stringify(task.listening.userResponse)}

  Speaking:
  Prompt: ${task.speaking.prompt}
  Student Audio: ${
    task.speaking.userResponse ? "[Audio Submitted]" : "Not submitted"
  }

  Return JSON only, structure:
  {
    "writing": {"strengths":"...", "weaknesses":"...", "feedback":"..."},
    "reading": {"strengths":"...", "weaknesses":"...", "feedback":"..."},
    "listening": {"strengths":"...", "weaknesses":"...", "feedback":"..."},
    "speaking": {"strengths":"...", "weaknesses":"...", "feedback":"..."}
  }
  `;

    const feedbackStr = await chatWithGroq(evalPrompt);

    if (!feedbackStr) {
      return null;
    }

    let feedback;
    try {
      feedback = JSON.parse(
        feedbackStr
          .replace(/```(json)?/g, "")
          .replace(/```/g, "")
          .trim()
      );
    } catch (e) {
      feedback = { error: "Failed to parse AI feedback", raw: feedbackStr };
    }

    task.writing.feedback = feedback.writing || "";
    task.reading.feedback = feedback.reading || "";
    task.listening.feedback = feedback.listening || "";
    task.speaking.feedback = feedback.speaking || "";
    await task.save();

    return { task, feedback };
  }

  async addUserResponse(taskId: string, type: string, userResponse: any) {
    const task = await this._dailyTaskRepository.findById(taskId);
    if (!task) return null;

    task.userResponses[type] = userResponse;

    if (type === "writing") task.writing.userResponse = userResponse;
    else if (type === "speaking") task.speaking.userResponse = userResponse;
    else if (type === "reading") task.reading.userResponse = userResponse;
    else if (type === "listening") task.listening.userResponse = userResponse;

    await task.save();
    return mapDailyTaskToDto(task);
  }

  async getUserLatestTask(userId: string): Promise<DailyTaskDto | null> {
    const today = new Date();
    const dayStart = new Date(today.setHours(0, 0, 0, 0));

    let task = await this._dailyTaskRepository.findByUserAndDate(
      userId,
      dayStart
    );

    if (!task) {
      return null;
    }

    return mapDailyTaskToDto(task);
  }

  async getAllUsersLatestTasks(): Promise<DailyTaskDto[]> {
    const today = new Date();
    const dayStart = new Date(today.setHours(0, 0, 0, 0));
    const tasks = await this._dailyTaskRepository.findAllByDate(dayStart);
    return tasks.map(mapDailyTaskToDto);
  }
}
