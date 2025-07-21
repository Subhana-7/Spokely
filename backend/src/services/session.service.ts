import { SessionRepository } from "../repositories/session.repository";
import { ISession } from "../models/sessions.model";

export class SessionService {
  private readonly repo: SessionRepository;

  constructor() {
    this.repo = new SessionRepository();
  }

  async createSession(sessionData: Partial<ISession>) {
    return await this.repo.createSession(sessionData);
  }

  async getSessions() {
    return await this.repo.getAllSessions();
  }

  async getSessionById(id: string) {
    return await this.repo.getSessionById(id);
  }

  async updateSession(id: string, updates: Partial<ISession>) {
    return await this.repo.updateSession(id, updates);
  }
}
