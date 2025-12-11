export interface TaskDetailDto {
  prompt: string;
  paragraph?: string;
  questions?: string[];
  userResponse?: string | string[] | Record<number, string>;
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
