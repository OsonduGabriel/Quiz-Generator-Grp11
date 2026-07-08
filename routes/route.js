import express from 'express';
import { getQuestions, createQuizFromQuestions } from '../services/service.js';
import { validateQuizRequest } from '../utils/validation.js';

const router = express.Router();

// A simple health check route to confirm the API is running.
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Quiz generator API is running' });
});

// Get all quiz questions.
router.get('/quiz', async (req, res) => {
  try {
    const questions = await getQuestions();
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to load questions',
      error: error.message,
    });
  }
});

// Create a quiz from the request body.
router.post('/quiz', async (req, res) => {
  const validation = validateQuizRequest(req.body);

  if (!validation.isValid) {
    return res.status(400).json({ success: false, errors: validation.errors });
  }

  try {
    const quiz = await createQuizFromQuestions(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to create quiz',
      error: error.message,
    });
  }
});

// Get one quiz question by its id.
router.get('/quiz/:id', async (req, res) => {
  try {
    const questions = await getQuestions();
    const question = questions.find((item) => String(item.id) === req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to load question',
      error: error.message,
    });
  }
});

// Catch-all for unknown routes.
router.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default router;
