import { Document, Model } from "mongoose";
import { IBaseRepository } from "./interfaces/IBaseRepository";
import { injectable } from "inversify";

@injectable()
export abstract class BaseRepository<T extends Document>
  implements IBaseRepository<T>
{
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    try {
      return this.model.findById(id);
    } catch (error) {
      console.error("findById error:", error);
      return null;
    }
  }

  async findOne(query: Partial<Record<keyof T, any>>): Promise<T | null> {
    try {
      console.log(query);
      return this.model.findOne(query);
    } catch (error) {
      console.error("findOne error:", error);
      return null;
    }
  }

  async findAll(
    query: Partial<Record<keyof T, any>> = {},
    options?: { page?: number; limit?: number }
  ): Promise<{ results: T[]; total: number }> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 0;
      const skip = (page - 1) * limit;

      const results = await this.model.find(query).skip(skip).limit(limit);
      const total = await this.model.countDocuments(query);

      return { results, total };
    } catch (error) {
      console.error("findAll error:", error);
      return { results: [], total: 0 };
    }
  }

  async create(data: Partial<T>): Promise<T | null> {
    try {
      return this.model.create(data);
    } catch (error) {
      console.error("create error:", error);
      return null;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      return this.model.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.error("update error:", error);
      return null;
    }
  }

  async delete(id: string): Promise<T | null> {
    try {
      return this.model.findByIdAndDelete(id);
    } catch (error) {
      console.error("delete error:", error);
      return null;
    }
  }
}
