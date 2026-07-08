import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fsp = fs.promises;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data file lives in /data/questions.json at the project root.
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'questions.json');

// Simple write queue so concurrent write operations (POST/PUT/DELETE
// happening back-to-back) don't race each other and clobber the file.
let writeQueue = Promise.resolve();

/**
 * Ensures the data directory and data file exist.
 * Creates the folder recursively and/or an empty-array file
 * if either is missing.
 */
async function ensureStorageReady() {
  if (!fs.existsSync(DATA_DIR)) {
    await fsp.mkdir(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    await fsp.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

/**
 * Reads and parses the JSON data file.
 * Self-heals (resets to an empty array) instead of throwing if the
 * file is missing, empty, or contains corrupted JSON — this keeps
 * the API usable instead of crashing on a bad read.
 *
 * @returns {Promise<Array<Object>>}
 */
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

/**
 * Atomically writes the given array of questions to the data file.
 * Writes to a temp file first, then renames it over the real file,
 * so a crash mid-write can never leave questions.json half-written.
 *
 * @param {Array<Object>} data
 */
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

/**
 * Queues a write operation so multiple writes never overlap.
 * Every mutating helper below routes through this.
 *
 * @param {(data: Array<Object>) => Array<Object>|Promise<Array<Object>>} mutator
 * @returns {Promise<Array<Object>>} the data array that was written
 */
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

/* ------------------------- Public CRUD API ------------------------- */

/** Get every question. @returns {Promise<Array<Object>>} */
async function getAll() {
  return readData();
}

/**
 * Get a single question by id.
 * @param {string} id
 * @returns {Promise<Object|undefined>}
 */
async function getById(id) {
  const data = await readData();
  return data.find((item) => item.id === id);
}

/**
 * Append a new question record. Assumes the caller (routes/validation
 * layer) has already built the full record — id, timestamps, and
 * validated fields.
 * @param {Object} record
 * @returns {Promise<Object>} the record that was saved
 */
async function create(record) {
  await queueWrite((data) => {
    data.push(record);
    return data;
  });
  return record;
}

/**
 * Merge updates into an existing question by id.
 * `id` and `createdAt` are always preserved from the original record;
 * `updatedAt` is always refreshed to now.
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object|null>} the updated record, or null if not found
 */
async function update(id, updates) {
  let updatedRecord = null;

  await queueWrite((data) => {
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      return data; // no-op, record not found
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

/**
 * Delete a question by id.
 * @param {string} id
 * @returns {Promise<boolean>} true if a record was removed
 */
async function remove(id) {
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
