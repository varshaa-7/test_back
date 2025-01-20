const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    score: { type: Number, required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        selectedOption: { type: Schema.Types.ObjectId, ref: "Question.options" },
      },
    ],
    warnings: { type: Number, default: 0 },
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now },
    maxAttempts: { type: Number, default: 3 }, // Default max attempts for each quiz
    cooldownPeriod: { type: Number, default: 24 }, // cooldown period in hours
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
