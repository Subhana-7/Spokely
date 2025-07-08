import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { ConnectionService } from "../services/connections.service";

const service = new ConnectionService();

export const sendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.id) throw new Error("User not authenticated");

    const senderId = req.id;
    const { referralCode } = req.body;
    const connection = await service.sendConnectionRequest(
      senderId,
      referralCode
    );
    res.status(201).json(connection);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.id) throw new Error("User not authenticated");
    const userId = req.id;
    const requests = await service.getIncomingRequests(userId);
    res.status(200).json(requests);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const acceptConnection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { requestId } = req.params;
    const accepted = await service.acceptRequest(requestId);
    res.status(200).json(accepted);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const listConnections = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.id) throw new Error("User not authenticated");
    const userId = req.id;
    const connections = await service.getAllConnections(userId);
    res.status(200).json(connections);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  } 
};

export const getSentRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.id) throw new Error("User not authenticated");
    const userId = req.id;
    const requests = await service.getOutgoingRequests(userId);
    res.status(200).json(requests);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

