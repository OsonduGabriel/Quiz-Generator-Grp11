import express from "express";
import {
  getQuestions,
  getQuestionById,
  createQuizFromQuestions,
  updateQuestion,
  deleteQuestion,
} from "../services/service.js";

import { validateQuizRequest } from "../utils/validation.js";

const router = express.Router();

// Health Check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Quiz Generator API Running",
  });
});

// GET ALL
router.get("/quiz", async (req, res) => {
  try {
    const quizzes = await getQuestions();

    res.json({
      success: true,
      data: quizzes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET ONE
router.get("/quiz/:id", async (req, res) => {
  try {
    const quiz = await getQuestionById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// CREATE
router.post("/quiz", async (req, res) => {
  const validation = validateQuizRequest(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  try {
    const quiz = await createQuizFromQuestions(req.body);

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

console.log("PUT route loaded");

// UPDATE
router.put("/quiz/:id", async (req, res) => {
  const validation = validateQuizRequest(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  try {
    const updated = await updateQuestion(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE
router.delete("/quiz/:id", async (req, res) => {
  try {
    const deleted = await deleteQuestion(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;