export interface FeedbackDto {
  strengths?: string;
  weaknesses?: string;
  feedback?: string;
}

export interface TaskDetailDto {
  prompt: string;
  paragraph?: string;
  questions?: string[];
  userResponse?: string | string[] | Record<number, string>;
  feedback?: FeedbackDto;
}

export interface DailyTaskDto {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  topic: string;
  taskDate: Date;
  writing: TaskDetailDto;
  reading: TaskDetailDto;
  speaking: TaskDetailDto;
  listening: TaskDetailDto;
  createdAt: Date;
}

export interface CreateDailyTaskDto {
  userId: string;
  topic: string;
}

export interface DailyTaskResponses  {
  writing?: WritingResponse;
  reading?: ReadingResponse;
  listening?: ListeningResponse;
  speaking?: SpeakingResponse;
};

type WritingResponse = string;
type SpeakingResponse = string; 
type ReadingResponse = Record<number, string>;
type ListeningResponse = Record<number, string>;
