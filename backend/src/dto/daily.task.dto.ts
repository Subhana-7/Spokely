export interface TaskDetailDto {
  prompt: string;                // For all tasks
  paragraph?: string;            // Only for reading & listening
  questions?: string[];          // Only for reading & listening
  userResponse?: string;         // User answer
}


export interface DailyTaskDto {
  id: string;
  userId: string;
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
