import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { validateQuiz } from '../utils/validation.js';

const fsp = fs.promises;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'questions.json');


let writeQueue = Promise.resolve();


async function ensureStorageReady() {
  if (!fs.existsSync(DATA_DIR)) {
    await fsp.mkdir(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    await fsp.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

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


function queueWrite(mutator) {
  writeQueue = writeQueue
    .then(async () => {
      const current = await readData();
      const next = await mutator(current);
      await writeData(next);
      return next;
    })
    .catch((err) => {
      console.error('[service] Write queue error:', err.message);
      throw err;
    });

  return writeQueue;
}


function makeValidationError(errors) {
  const error = new Error(
    Array.isArray(errors) && errors.length ? errors.join('; ') : 'Quiz validation failed'
  );
  error.name = 'ValidationError';
  error.errors = errors;
  return error;
}


async function getAllQuizzes() {
  return readData();
}


async function getQuizById(id) {
  const data = await readData();
  return data.find((item) => item.id === id);
}

async function createQuiz(quiz) {
  const { valid, errors } = validateQuiz(quiz);
  if (!valid) {
    throw makeValidationError(errors);
  }

  const now = new Date().toISOString();
  const record = {
    ...quiz,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await queueWrite((data) => {
    data.push(record);
    return data;
  });

  return record;
}


async function updateQuiz(id, updates) {
  let updatedRecord = null;

  await queueWrite((data) => {
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      return data;
    }

    const existing = data[index];
    const merged = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    const { valid, errors } = validateQuiz(merged);
    if (!valid) {
      throw makeValidationError(errors);
    }

    updatedRecord = {
      ...merged,
      updatedAt: new Date().toISOString(),
    };
    data[index] = updatedRecord;
    return data;
  });

  return updatedRecord;
}


async function deleteQuiz(id) {
  let removed = false;

  await queueWrite((data) => {
    const next = data.filter((item) => item.id !== id);
    removed = next.length !== data.length;
    return next;
  });

  return removed;
}

export default {
  DATA_FILE,
  ensureStorageReady,
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};

export {
  DATA_FILE,
  ensureStorageReady,
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
