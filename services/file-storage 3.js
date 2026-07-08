import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data", "questions.json");

async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function getAllQuizzes() {
  return await readData();
}

export async function getQuizById(id) {
  const quizzes = await readData();
  return quizzes.find((quiz) => quiz.id === id);
}

export async function createQuiz(quiz) {
  const quizzes = await readData();

  quizzes.push(quiz);

  await writeData(quizzes);

  return quiz;
}

export async function updateQuiz(id, updatedQuiz) {
  const quizzes = await readData();

  const index = quizzes.findIndex((quiz) => quiz.id === id);

  if (index === -1) {
    return null;
  }

  quizzes[index] = {
    ...quizzes[index],
    ...updatedQuiz,
    id,
  };

  await writeData(quizzes);

  return quizzes[index];
}

export async function deleteQuiz(id) {
  const quizzes = await readData();

  const index = quizzes.findIndex((quiz) => quiz.id === id);

  if (index === -1) {
    return false;
  }

  quizzes.splice(index, 1);

  await writeData(quizzes);

  return true;
}