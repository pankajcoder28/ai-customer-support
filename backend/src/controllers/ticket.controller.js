import Ticket from "../models/ticket.model.js";
import Conversation from "../models/conversation.model.js";

// Get all tickets for a tenant (admin view)
export const getTenantTickets = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;

    const tickets = await Ticket.find({ tenantId })
      .sort({ createdAt: -1 })
      .populate("customerId", "name email")
      .populate("agentId", "name email");

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Get Tenant Tickets Error:", error);
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

// Get tickets for a customer
export const getCustomerTickets = async (req, res) => {
  try {
    const customerId = req.user?._id;
    const tenantId = req.user?.tenantId;

    const tickets = await Ticket.find({
      customerId,
      tenantId,
    })
      .sort({ createdAt: -1 })
      .populate("agentId", "name email");

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Get Customer Tickets Error:", error);
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

// Get single ticket details
export const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate("customerId", "name email phone")
      .populate("agentId", "name email")
      .populate("tenantId", "name");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Get Ticket Details Error:", error);
    res.status(500).json({
      message: "Failed to fetch ticket details",
      error: error.message,
    });
  }
};

// Assign ticket to an agent
export const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { agentId, status: "in_progress" },
      { new: true }
    ).populate("agentId", "name email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Assign Ticket Error:", error);
    res.status(500).json({
      message: "Failed to assign ticket",
      error: error.message,
    });
  }
};

// Update ticket status
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Update Ticket Status Error:", error);
    res.status(500).json({
      message: "Failed to update ticket status",
      error: error.message,
    });
  }
};

// Update ticket priority
export const updateTicketPriority = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({ message: "Priority is required" });
    }

    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        message: `Invalid priority. Allowed values: ${validPriorities.join(", ")}`,
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { priority },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({
      success: true,
      message: "Ticket priority updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Update Ticket Priority Error:", error);
    res.status(500).json({
      message: "Failed to update ticket priority",
      error: error.message,
    });
  }
};

// Resolve ticket
export const resolveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "resolved", isAiResolved: false },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({
      success: true,
      message: "Ticket resolved successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Resolve Ticket Error:", error);
    res.status(500).json({
      message: "Failed to resolve ticket",
      error: error.message,
    });
  }
};

// Close ticket
export const closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "closed" },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update related conversation if exists
    const conversation = await Conversation.updateMany(
      {
        _id: {
          $in: await require("../models/message.model.js").find({
            tenantId: ticket.tenantId,
          }),
        },
      },
      { status: "closed" }
    );

    res.status(200).json({
      success: true,
      message: "Ticket closed successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Close Ticket Error:", error);
    res.status(500).json({
      message: "Failed to close ticket",
      error: error.message,
    });
  }
};

// Get ticket statistics for dashboard
export const getTicketStats = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;

    const stats = await Ticket.aggregate([
      { $match: { tenantId: tenantId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        highPriority: 0,
      },
    });
  } catch (error) {
    console.error("Get Ticket Stats Error:", error);
    res.status(500).json({
      message: "Failed to fetch ticket statistics",
      error: error.message,
    });
  }
};
