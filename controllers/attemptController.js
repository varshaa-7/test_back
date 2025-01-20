const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");

/**
 * Issue a warning to a user for a specific quiz attempt.
 */
exports.issueWarning = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId } = req.user;

    const lastAttempt = await Attempt.findOne({ quizId, userId }).sort({ createdAt: -1 });
    if (!lastAttempt) {
      return res.status(404).json({
        success: false,
        message: "No attempts found for this quiz.",
      });
    }

    // Increment warnings
    lastAttempt.warnings += 1;

    // If warnings exceed 2, mark the quiz as complete
    if (lastAttempt.warnings > 2) {
      lastAttempt.completed = true;
      await lastAttempt.save();

      return res.status(200).json({
        success: true,
        message: "Warnings exceeded the limit. The quiz has been marked as complete.",
      });
    }

    await lastAttempt.save();

    return res.status(200).json({
      success: true,
      message: "Warning issued successfully.",
      warnings: lastAttempt.warnings,
    });
  } catch (error) {
    console.error("Error issuing warning:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Get the status of a quiz attempt for a user.
 */
exports.getQuizStatus = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId } = req.user;

    const lastAttempt = await Attempt.findOne({ quizId, userId }).sort({ createdAt: -1 });
    if (!lastAttempt) {
      return res.status(404).json({
        success: false,
        message: "No attempts found for this quiz.",
      });
    }

    return res.status(200).json({
      success: true,
      message: lastAttempt.completed
        ? "The quiz has been completed."
        : "The quiz is still in progress.",
      warnings: lastAttempt.warnings,
      completed: lastAttempt.completed,
    });
  } catch (error) {
    console.error("Error fetching quiz status:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
