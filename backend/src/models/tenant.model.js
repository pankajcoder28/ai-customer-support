import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const tenantModel = mongoose.model("Tenant", tenantSchema);
export default tenantModel