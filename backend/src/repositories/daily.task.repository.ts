import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { IDailyTask, DailyTaskModel } from "../models/daily.task.model";

@injectable()
export class DailyTaskRepository extends BaseRepository<IDailyTask> {
  constructor() {
    super(DailyTaskModel);
  }

  // async findByUserAndDate(userId: string, date: Date): Promise<IDailyTask | null> {
  //   return this.model.findOne({ userId, date }); // ✅ match schema
  // }

  async findByUserAndDate(userId: string, date: Date): Promise<IDailyTask | null> {
  return this.model.findOne({ userId, date });
}


  async create(data: Partial<IDailyTask>): Promise<IDailyTask | null> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<IDailyTask | null> {
    console.log('repo findbyid',id);
    let res =  this.model.findById(id).exec();
    console.log('res',res)
    return res;
  }
}
