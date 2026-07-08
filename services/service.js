import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from "../file-storage.js";

// Get all quizzes
export async function getQuestions() {
  return await getAllQuizzes();
}

// Get one quiz
export async function getQuestionById(id) {
  return await getQuizById(id);
}

// Create a quiz
export async function createQuizFromQuestions(data) {
  const quiz = {
    id: Date.now().toString(),
    title: data.title,
    questions: data.questions,
    createdAt: new Date().toISOString()
  };

  return await createQuiz(quiz);
}

// Update a quiz
export async function updateQuestion(id, data) {
  return await updateQuiz(id, data);
}

// Delete a quiz
export async function deleteQuestion(id) {
  return await deleteQuiz(id);
}