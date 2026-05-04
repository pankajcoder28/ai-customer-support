
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },

    // kis user ka conversation
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["open", "closed", "pending"],
      default: "open"
    },

    // last message preview (fast UI ke liye)
    lastMessage: {
      type: String,
      default: ""
    },

    // last message time (sorting ke liye)
    lastMessageAt: {
      type: Date,
      default: Date.now
    }

  },
  {
    timestamps: true
  }
);

// 🔥 important index
conversationSchema.index({ tenantId: 1, customerId: 1 });

const conversationModel = mongoose.model("Conversation", conversationSchema);

export default conversationModel;