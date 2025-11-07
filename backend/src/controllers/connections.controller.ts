import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { IConnectionController } from "./interfaces/IConnectionsController";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IConnectionService } from "../services/interfaces/IConnectionsService";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";

@injectable()
export class ConnectionController implements IConnectionController {
  constructor(
    @inject(TYPES.IConnectionService)
    private _connectionsService: IConnectionService
  ) {}

  async sendRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.id) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

      const senderId = req.id;
      const { uniqueCode } = req.body;

      const connection = await this._connectionsService.sendConnectionRequest(
        senderId,
        uniqueCode
      );
      res.status(STATUS_CODES.CREATED).json(connection);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  }

  async getRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.id) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

      const requests = await this._connectionsService.getIncomingRequests(
        req.id
      );
      res.status(STATUS_CODES.OK).json(requests);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  }

  async acceptConnection(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.id) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);
      console.log(req.body.requestId);
      const { requestId } = req.body;
      const userId = req.id;

      console.log("contro", requestId, userId);
      const accepted = await this._connectionsService.acceptRequest(
        requestId,
        userId
      );
      res.status(STATUS_CODES.OK).json(accepted);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  }

   async listConnections(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.id) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

      const userId = req.id;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "all";
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);

      const result = await this._connectionsService.getAllConnections(userId, {
        search,
        status,
        page,
        limit,
      });

      if (!result) {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: "No connections found" });
        return;
      }

      res.status(STATUS_CODES.OK).json(result);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  }

  async getSentRequests(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.id) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

      const requests = await this._connectionsService.getOutgoingRequests(
        req.id
      );
      res.status(STATUS_CODES.OK).json(requests);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  }

  async blockConnection(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.id!;
      const connectionId = req.params.id;
      console.log(connectionId);
      const updated = await this._connectionsService.blockConnection(
        connectionId,
        userId
      );
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async unblockConnection(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.id!;
      const connectionId = req.params.id;
      const updated = await this._connectionsService.unblockConnection(
        connectionId,
        userId
      );
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async removeConnection(req: AuthenticatedRequest, res: Response) {
    try {
      const connectionId = req.params.id;
      const result = await this._connectionsService.removeConnection(
        connectionId
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
