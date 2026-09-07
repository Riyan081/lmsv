import { Router } from "express";
import { hostelController } from "../controllers/hostel.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import {
  createHostelSchema, createRoomSchema, allocateRoomSchema,
  createGatePassSchema, updateGatePassStatusSchema,
  createComplaintSchema, updateComplaintStatusSchema,
} from "@repo/common/schemas";

const router = Router();
router.use(requireAuth);

// ─── Hostels ────────────────────────────────────────────────
router.get("/", requireRole("admin", "warden", "student"), asyncHandler(hostelController.getAllHostels));
router.post("/", requireRole("admin"), validate(createHostelSchema), asyncHandler(hostelController.createHostel));

// ─── Rooms (Admin/Warden) ───────────────────────────────────
router.get("/:hostelId/rooms", requireRole("admin", "warden"), asyncHandler(hostelController.getRooms));
router.post("/rooms", requireRole("admin", "warden"), validate(createRoomSchema), asyncHandler(hostelController.createRoom));

// ─── Allocation (Admin/Warden) ──────────────────────────────
router.post("/allocate", requireRole("admin", "warden"), validate(allocateRoomSchema), asyncHandler(hostelController.allocateRoom));
router.patch("/allocate/:id/vacate", requireRole("admin", "warden"), asyncHandler(hostelController.vacateRoom));

// ─── Gate Pass ──────────────────────────────────────────────
router.post("/gate-pass", requireRole("student"), validate(createGatePassSchema), asyncHandler(hostelController.createGatePass));
router.get("/gate-pass", requireRole("admin", "warden", "student"), asyncHandler(hostelController.getGatePasses));
router.patch("/gate-pass/:id/status", requireRole("admin", "warden"), validate(updateGatePassStatusSchema), asyncHandler(hostelController.updateGatePassStatus));

// ─── Complaints ─────────────────────────────────────────────
router.post("/complaints", requireRole("student"), validate(createComplaintSchema), asyncHandler(hostelController.createComplaint));
router.get("/complaints", requireRole("admin", "warden", "student"), asyncHandler(hostelController.getComplaints));
router.patch("/complaints/:id/status", requireRole("admin", "warden"), validate(updateComplaintStatusSchema), asyncHandler(hostelController.updateComplaintStatus));

export default router;
