# Quiz Generator API — Group 11, Project 16

A backend RESTful API for creating, reading, updating, deleting and scoring quizzes, built with Node.js, Express, and file-based JSON storage.

## Table of Contents
- [Installation & Setup](#installation--setup)
- [Endpoints](#endpoints)
- [Data Model](#data-model)
- [Team Members](#team-members)
- [Known Issues & Limitations](#known-issues--limitations)

## Installation & Setup

**Prerequisites:** Node.js should be installed on your machine.

```bash
# Clone the repository
git clone <https://github.com/OsonduGabriel/Quiz-Generator-Grp11.git>

#Enter the project folder
cd <quiz-generator-grp11>

# Install dependencies
npm install

# Start the server
npm run dev
```

The server runs on `http://localhost:3000`

## Endpoints

### GET /resources
Returns all quizzes in the storage file

#### Request
**GET /resources**

**Response — 200 OK**
```json
[
  {
    "id": "1",
    "title": "JavaScript Basics",
    "questions": {
        "question": "What keyword declares a constant?",
        "options": ["var", "let", "const", "static"],
        "correctAnswer": "const"
      }
    ,
    "createdAt": "2026-07-01T10:00:00.000Z",
    "updatedAt": "2026-07-01T10:00:00.000Z"
  }
]
```

### GET /resources/:id
Returns a single quiz by ID entered by user.

#### Request
**GET /resources/1**

**Response — 200 OK**
```json
{
  "id": "1",
  "title": "JavaScript Basics",
  "questions": {},
  "createdAt": "2026-07-01T10:00:00.000Z",
  "updatedAt": "2026-07-01T10:00:00.000Z"
}
```

**Response — 404 Not Found**
```json
{ "message": "Quiz with id: 1 not found" }
```

### POST /resources
Creates a new quiz with data from user.

**Request Body**
```json
{
  "title": "JavaScript Basics",
  "questions": [
    {
      "question": "What keyword declares a constant?",
      "options": ["var", "let", "const", "static"],
      "correctAnswer": "const"
    }
  ]
}
```

**Response — 201 Created**
```json
{
  "id": "1",
  "title": "JavaScript Basics",
  "questions": [ ... ],
  "createdAt": "2026-07-08T10:00:00.000Z",
  "updatedAt": "2026-07-08T10:00:00.000Z"
}
```

**Response — 400 Bad Request** (validation failure)
```json
{ "message": "Quiz title is required" }
```

### PUT /resources/:id
Updates an existing quiz.

#### Request
**PUT /resources/1**

**Request Body**
```json
{
  "title": "JavaScript Basics — Updated"
}
```

**Response — 200 OK**
```json
{
  "id": "1",
  "title": "JavaScript Basics — Updated",
  "questions": {},
  "createdAt": "2026-07-01T10:00:00.000Z",
  "updatedAt": "2026-07-08T11:30:00.000Z"
}
```

**Response — 404 Not Found**
```json
{ "message": "Quiz with id: 1 not found" }
```

### DELETE /resources/:id
Deletes a quiz.

#### Request
**DELETE /resources/1**

**Response — 200 OK**
```json
{ "message": "Quiz successfully deleted" }
```

**Response — 404 Not Found**
```json
{ "message": "Quiz with id: 1 not found" }
```

## Data Model

```json
{
  "id": "string, unique",
  "title": "string, required",
  "questions": [
    {
      "id": "string, unique within quiz",
      "question": "string, required",
      "options": ["array of strings"],
      "correctAnswer": "string, must match one of the options"
    }
  ],
  "createdAt": "ISO 8601 date string, set on creation",
  "updatedAt": "ISO 8601 date string, updated on every edit"
}
```

## Team

| Member | Role | What They Built |
|--------|------|------------------|
| [Osondu-Gabriel] | Routes & README | Express route handlers for all CRUD endpoints (`routes/`) and README project documentation |
| [Name] | File Storage | JSON file read/write logic, ID generation, timestamps (`services/`) |
| [Popoola-Divine-Gbolahan] | Validation | Request body validation, required fields, type checks (`validation/` or `utils/`) |
| [Name] | Testing | Endpoint testing using POSTMAN|

## Known Issues & Limitations

- [ ] No pagination on GET /resources. The endpoint always returns every single quiz in the file, all at once.
- [ ] No authentication or authorization is implemented. 
- [ ] Data is stored in a local JSON file and may not be suitable for large-scale applications.
