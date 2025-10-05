export interface TaskDetailDto {
  prompt: string;                
  paragraph?: string;           
  questions?: string[];        
  userResponse?: string;        
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
