import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { ConnectionService } from "../services/connections.service";
import { IConnectionController } from "./interfaces/IConnectionsController";
import { inject,injectable } from "inversify";
import { TYPES } from "../types/types";
import { IConnectionService } from "../services/interfaces/IConnectionsService";

@injectable()
export class ConnectionController implements IConnectionController {
  constructor(
    @inject(TYPES.IConnectionService) private service: IConnectionService
  ) {}


  async sendRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.id) throw new Error("User not authenticated");

      const senderId = req.id;
      const { uniqueCode } = req.body;

      const connection = await this.service.sendConnectionRequest(
        senderId,
        uniqueCode
      );
      res.status(201).json(connection);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async getRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.id) throw new Error("User not authenticated");

      const userId = req.id;
      const requests = await this.service.getIncomingRequests(userId);

      res.status(200).json(requests);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async acceptConnection(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.id) throw new Error("User not authenticated");

    const { requestId } = req.params;
    const userId = req.id;

    const accepted = await this.service.acceptRequest(requestId, userId);

    res.status(200).json(accepted);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}


  async listConnections(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.id) throw new Error("User not authenticated");

    const userId = req.id;
    const search = req.query.search as string; // <-- get query param

    const connections = await this.service.getAllConnections(userId, search);
    res.status(200).json(connections);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}


  async getSentRequests(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.id) throw new Error("User not authenticated");

      const userId = req.id;
      const requests = await this.service.getOutgoingRequests(userId);

      console.log(requests)
      res.status(200).json(requests);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
