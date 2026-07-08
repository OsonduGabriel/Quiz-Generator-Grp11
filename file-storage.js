import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  await ensureStorageReady();

  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf8');
    if (!raw || raw.trim().length === 0) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Data file does not contain a JSON array');
    }
    return parsed;
  } catch (err) {
    console.error(`[service] Failed to read/parse ${DATA_FILE}:`, err.message);
    await fsp.writeFile(DATA_FILE, '[]', 'utf8');
    return [];
  }
}


async function writeData(data) {
  if (!Array.isArray(data)) {
    throw new TypeError('writeData expects an array');
  }

  await ensureStorageReady();

  const tempFile = path.join(DATA_DIR, `.questions.tmp-${process.pid}-${Date.now()}.json`);
  const json = JSON.stringify(data, null, 2);

  await fsp.writeFile(tempFile, json, 'utf8');
  await fsp.rename(tempFile, DATA_FILE);
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




async function getAllQuizzes() {
  return readData();
}


async function getQuizById(id) {
  const data = await readData();
  return data.find((item) => item.id === id);
}

async function createQuiz(record) {
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
    updatedRecord = {
      ...data[index],
      ...updates,
      id: data[index].id,
      createdAt: data[index].createdAt,
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
  getAll,
  getById,
  create,
  update,
  remove,
};

export { DATA_FILE, ensureStorageReady, getAll, getById, create, update, remove };
