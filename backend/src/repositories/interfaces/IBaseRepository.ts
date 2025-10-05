import { Document } from "mongoose";

export interface IBaseRepository<T extends Document> {
  findById(id: string): Promise<T | null>;
  findOne(query: Partial<Record<keyof T, any>>): Promise<T | null>;
  findAll(
    query?: Partial<Record<keyof T, any>>,
    options?: { page?: number; limit?: number }
  ): Promise<{ results: T[]; total: number }>;
  create(data: Partial<T>): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
}