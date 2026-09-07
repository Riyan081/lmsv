import type { Request, Response } from "express";
import { hostelService } from "../services/hostel.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { logActivity } from "../middleware/activity-logger.js";

export const hostelController = {
  // Hostel
  createHostel: async (req: Request, res: Response) => {
    const hostel = await hostelService.createHostel(req.body);
    await logActivity({
      userId: (req as any).user?.id, action: "create", module: "hostel",
      entityType: "Hostel", entityId: hostel.id,
      description: `Created hostel "${hostel.name}"`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, "Hostel created", hostel, 201);
  },
  getAllHostels: async (_req: Request, res: Response) => {
    const hostels = await hostelService.getAllHostels();
    sendSuccess(res, "Hostels retrieved", hostels);
  },

  // Rooms
  createRoom: async (req: Request, res: Response) => {
    const room = await hostelService.createRoom(req.body);
    sendSuccess(res, "Room created", room, 201);
  },
  getRooms: async (req: Request, res: Response) => {
    const rooms = await hostelService.getRooms(req.params.hostelId as string);
    sendSuccess(res, "Rooms retrieved", rooms);
  },

  // Allocation
  allocateRoom: async (req: Request, res: Response) => {
    const allocation = await hostelService.allocateRoom(req.body);
    await logActivity({
      userId: (req as any).user?.id, action: "create", module: "hostel",
      entityType: "HostelAllocation", entityId: allocation.id,
      description: `Allocated room to ${allocation.student.name}`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, "Room allocated", allocation, 201);
  },
  vacateRoom: async (req: Request, res: Response) => {
    const result = await hostelService.vacateRoom(req.params.id as string);
    sendSuccess(res, "Room vacated", result);
  },

  // Gate Pass
  createGatePass: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const gatePass = await hostelService.createGatePass(user.id, req.body);
    sendSuccess(res, "Gate pass requested", gatePass, 201);
  },
  getGatePasses: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const studentId = user?.role === "student" ? user.id : (req.query.studentId as string);
    const result = await hostelService.getGatePasses({
      studentId,
      status: req.query.status as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    });
    sendPaginated(res, "Gate passes retrieved", result.records, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },
  updateGatePassStatus: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const gatePass = await hostelService.updateGatePassStatus(req.params.id as string, req.body.status, user.id);
    await logActivity({
      userId: user.id,
      action: req.body.status === "approved" ? "approve" : "reject",
      module: "hostel",
      entityType: "GatePass",
      entityId: gatePass.id,
      description: `${req.body.status === "approved" ? "Approved" : "Rejected"} gate pass for ${(gatePass as any).student?.name ?? gatePass.studentId}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, `Gate pass ${req.body.status}`, gatePass);
  },

  // Complaints
  createComplaint: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const complaint = await hostelService.createComplaint(user.id, req.body);
    sendSuccess(res, "Complaint filed", complaint, 201);
  },
  getComplaints: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const studentId = user?.role === "student" ? user.id : undefined;
    const result = await hostelService.getComplaints({
      studentId,
      status: req.query.status as string,
      hostelId: req.query.hostelId as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    });
    sendPaginated(res, "Complaints retrieved", result.records, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },
  updateComplaintStatus: async (req: Request, res: Response) => {
    const complaint = await hostelService.updateComplaintStatus(req.params.id as string, req.body.status);
    sendSuccess(res, "Complaint status updated", complaint);
  },
};
