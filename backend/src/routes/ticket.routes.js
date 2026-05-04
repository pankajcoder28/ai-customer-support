import express from "express";
import {
  getTenantTickets,
  getCustomerTickets,
  getTicketDetails,
  assignTicket,
  updateTicketStatus,
  updateTicketPriority,
  resolveTicket,
  closeTicket,
  getTicketStats,
} from "../controllers/ticket.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Ticket listing and details
router.get("/", getTenantTickets); // All tickets for tenant (admin)
router.get("/customer", getCustomerTickets); // Tickets for specific customer
router.get("/stats", getTicketStats); // Ticket statistics
router.get("/:ticketId", getTicketDetails); // Single ticket details

// Ticket actions
router.post("/:ticketId/assign", assignTicket); // Assign to agent
router.patch("/:ticketId/status", updateTicketStatus); // Update status
router.patch("/:ticketId/priority", updateTicketPriority); // Update priority
router.post("/:ticketId/resolve", resolveTicket); // Resolve ticket
router.post("/:ticketId/close", closeTicket); // Close ticket

export default router;
