import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { ConnectionService } from "../services/connections.service";

export class ConnectionController {
  private service: ConnectionService;

  constructor() {
    this.service = new ConnectionService();

    this.sendRequest = this.sendRequest.bind(this);
    this.getRequests = this.getRequests.bind(this);
    this.acceptConnection = this.acceptConnection.bind(this);
    this.listConnections = this.listConnections.bind(this);
    this.getSentRequests = this.getSentRequests.bind(this);
  }

  async sendRequest(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.id) throw new Error("User not authenticated");

      const senderId = req.id;
      const { referralCode } = req.body;

      const connection = await this.service.sendConnectionRequest(
        senderId,
        referralCode
      );

      res.status(201).json(connection);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async getRequests(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.id) throw new Error("User not authenticated");

      const userId = req.id;
      const requests = await this.service.getIncomingRequests(userId);

      res.status(200).json(requests);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async acceptConnection(req: AuthenticatedRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const accepted = await this.service.acceptRequest(requestId);
      res.status(200).json(accepted);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async listConnections(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.id) throw new Error("User not authenticated");

      const userId = req.id;
      const connections = await this.service.getAllConnections(userId);

      res.status(200).json(connections);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async getSentRequests(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.id) throw new Error("User not authenticated");

      const userId = req.id;
      const requests = await this.service.getOutgoingRequests(userId);

      res.status(200).json(requests);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
