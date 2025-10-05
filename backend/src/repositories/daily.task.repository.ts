import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { IDailyTask, DailyTaskModel } from "../models/daily.task.model";

@injectable()
export class DailyTaskRepository extends BaseRepository<IDailyTask> {
  constructor() {
    super(DailyTaskModel);
  }

  async findByUserAndDate(userId: string, taskDate: Date):Promise<IDailyTask | null> {
    return this.model.findOne({ userId, taskDate });
  }
}
