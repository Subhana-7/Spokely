import { SessionRepository } from "../repositories/session.repository";
import { ISession } from "../models/sessions.model";
import { inject,injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import { CreateSessionDTO,UpdateSessionDTO } from "../dto/session.dto";

@injectable()
export class SessionService {
   private readonly repo: ISessionRepository;

  constructor(
    @inject(TYPES.ISessionRepository) repo: ISessionRepository
  ) {
    this.repo = repo;
  }

  async createSession(
    sessionData: CreateSessionDTO
  ): Promise<ISession | null> {
    try {
      return await this.repo.createSession(sessionData);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getSessions(userId:string): Promise<ISession[] | null> {
    try {
      return await this.repo.getAllSessions(userId);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getSessionById(id: string): Promise<ISession | null> {
    try {
      return await this.repo.getSessionById(id);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateSession(
    id: string,
    updates: UpdateSessionDTO
  ): Promise<ISession | null> {
    try {
      return await this.repo.updateSession(id, updates);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
  async publicSessions():Promise<ISession[] | null> {
    try {
      return await this.repo.getPublicSessions();
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}
