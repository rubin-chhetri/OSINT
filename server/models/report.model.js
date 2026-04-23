import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    targetName: {
      type: String,
      required: [true, "Target name is required"],
      trim: true,
      index: true, // Faster searching for history
    },
    // Array of results from different adapters
    results: [
      {
        source: { type: String, required: true }, // e.g., 'Google', 'GitHub'
        category: { type: String, required: true }, // e.g., 'Social', 'Technical'
        data: { type: mongoose.Schema.Types.Mixed }, // Raw data from API
        sourceUrl: { type: String },
        confidenceScore: { type: String }, // Entity Resolution result
        timestamp: { type: Date, default: Date.now },
      },
    ],
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    // Advanced Entity Resolution Fields
    resolutionStatus: { 
      type: String, 
      enum: ["Confirmed", "Ambiguous", "GIGO"],
      default: "GIGO"
    },
    primaryCluster: { type: String, default: "Unknown" },
    sharedPivots: [String],
    overallConfidence: { type: Number, default: 0 },
    vectorBreakdown: [
      {
        source: String,
        individualScore: Number,
        isCorroborated: Boolean,
        reason: String,
      },
    ],
    summary: { type: String },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

const Report = mongoose.model("Report", ReportSchema);
export default Report;
