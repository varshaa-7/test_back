const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");

const restrictQuizAttempts = async (req, res, next) => {
  try {
    const { id: quizId } = req.params;
    const { id: userId } = req.user;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const attempts = await Attempt.find({ userId, quizId }).sort({ createdAt: -1 });
    const totalAttempts = attempts.length;

    // Check if max attempts have been reached
    if (totalAttempts >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: "Maximum number of attempts reached for this quiz.",
      });
    }

    // Check warnings
    if (attempts.length > 0) {
      const lastAttempt = attempts[0];
      if (lastAttempt.warnings > 2) {
        // Mark the quiz as complete
        lastAttempt.completed = true;
        await lastAttempt.save();

        return res.status(400).json({
          success: false,
          message: "You cannot reattempt the quiz as warnings exceeded the limit. The quiz has been marked as complete.",
        });
      }

      // Check cooldown period
      const cooldownPeriodInMs = quiz.cooldownPeriod * 60 * 60 * 1000;
      const timeElapsedSinceLastAttempt = Date.now() - new Date(lastAttempt.createdAt).getTime();

      if (timeElapsedSinceLastAttempt < cooldownPeriodInMs) {
        const remainingTime = Math.ceil((cooldownPeriodInMs - timeElapsedSinceLastAttempt) / (60 * 60 * 1000)); // in hours
        return res.status(400).json({
          success: false,
          message: `You can reattempt the quiz after ${remainingTime} hour(s).`,
        });
      }
    }

    next();
  } catch (error) {
    console.error("Error in restrictQuizAttempts middleware:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = { restrictQuizAttempts };
