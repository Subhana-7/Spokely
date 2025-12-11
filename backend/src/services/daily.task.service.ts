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

import {
  DAILY_TASK_MESSAGES,
  TASK_TYPES,
  DAILY_TASK_LEVEL_HINT,
  DAILY_TASK_PROMPTS,
  DAILY_TASK_GENERATION,
  DailyTaskType,
} from "../utilis/constants";
import { IDailyTaskService } from "./interfaces/IDailyTaskService";

@injectable()
export class DailyTaskService implements IDailyTaskService {
  constructor(
    @inject(TYPES.IDailyTaskRepository)
    private readonly _dailyTaskRepository: IDailyTaskRepository
  ) {}

  private getLevelHint(level: number): string {
    if (level <= 1) return DAILY_TASK_LEVEL_HINT.EASY;
    if (level === 2) return DAILY_TASK_LEVEL_HINT.MEDIUM;
    return DAILY_TASK_LEVEL_HINT.HARD;
  }

  private async generateTaskDetail(
    topic: string,
    type: (typeof TASK_TYPES)[keyof typeof TASK_TYPES],
    level: number
  ): Promise<TaskDetailDto> {
    const levelHint = this.getLevelHint(level);
    let prompt = "";

    if (type === TASK_TYPES.WRITING || type === TASK_TYPES.SPEAKING) {
      prompt = `
        Generate a ${type} task for topic "${topic}".
        Difficulty: Level ${level}.
        Instruction: ${levelHint}.
        Output JSON ONLY:
        {
          "prompt": "${DAILY_TASK_GENERATION.WRITING_INSTRUCTION}"
        }
      `;
    } else {
      prompt = `
        Generate a ${type} task for topic "${topic}".
        Difficulty: Level ${level}.
        Provide a short paragraph (${DAILY_TASK_PROMPTS.PARAGRAPH_SENTENCE_COUNT}) 
        and exactly ${DAILY_TASK_PROMPTS.QUESTIONS_COUNT} questions.
        Output JSON ONLY:
        {
          "prompt": "${DAILY_TASK_GENERATION.READING_INSTRUCTION}",
          "paragraph": "text",
          "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"]
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
    } catch (err:unknown) {
      console.error(`AI JSON parse error for task type ${type}:`, err);
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

    const writing = await this.generateTaskDetail(
      dto.topic,
      TASK_TYPES.WRITING,
      level
    );
    const reading = await this.generateTaskDetail(
      dto.topic,
      TASK_TYPES.READING,
      level
    );
    const speaking = await this.generateTaskDetail(
      dto.topic,
      TASK_TYPES.SPEAKING,
      level
    );
    const listening = await this.generateTaskDetail(
      dto.topic,
      TASK_TYPES.LISTENING,
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

  async submitAll(taskId: string, responses: any) {
    const task = await this._dailyTaskRepository.findById(taskId);
    if (!task) return null;

    (Object.keys(responses) as DailyTaskType[]).forEach((key) => {
      if (task[key]) {
        task[key].userResponse = responses[key];
      }
    });

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
      feedback = JSON.parse(feedbackStr.replace(/```(json)?|```/g, "").trim());
    } catch {
      feedback = {
        error: DAILY_TASK_MESSAGES.ERROR.PARSE_FAILED,
        raw: feedbackStr,
      };
    }

    task.writing.feedback = feedback.writing || "";
    task.reading.feedback = feedback.reading || "";
    task.listening.feedback = feedback.listening || "";
    task.speaking.feedback = feedback.speaking || "";

    await task.save();

    await this.updateUserLevel(task.userId.toString());

    return { task, feedback };
  }

  async addUserResponse(taskId: string, type: string, userResponse: any) {
    const task = await this._dailyTaskRepository.findById(taskId);
    if (!task) return null;

    const section = type as DailyTaskType;

    task.userResponses[section] = userResponse;

    if (task[section]) {
      task[section].userResponse = userResponse;
    }

    await task.save();
    return mapDailyTaskToDto(task);
  }

  async getUserLatestTask(userId: string): Promise<DailyTaskDto | null> {
    const today = new Date();
    const dayStart = new Date(today.setHours(0, 0, 0, 0));

    const task = await this._dailyTaskRepository.findByUserAndDate(
      userId,
      dayStart
    );

    return task ? mapDailyTaskToDto(task) : null;
  }

  async getAllUsersLatestTasks(): Promise<DailyTaskDto[]> {
    const today = new Date();
    const dayStart = new Date(today.setHours(0, 0, 0, 0));

    const tasks = await this._dailyTaskRepository.findAllByDate(dayStart);

    return tasks.map(mapDailyTaskToDto);
  }

  async getDailyTaskById(dailyTaskId:string):Promise<any> {
    const task = await this._dailyTaskRepository.findById(dailyTaskId);
    return task;
  }

  private async updateUserLevel(userId: string) {
  const completedTasks = await this._dailyTaskRepository.countByUser(userId);

  const level = Math.floor(completedTasks / 5);

  const user = await userModel.findById(userId);

  if (user && level > (user.levels ?? 0)) {
    user.levels = level;
    await user.save();
  }
}

}
