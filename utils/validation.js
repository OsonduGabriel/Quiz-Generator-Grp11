export function validateQuizRequest(body) {
  const errors = [];

  if (!body.title || body.title.trim() === "") {
    errors.push("Title is required.");
  }

  if (!body.questions) {
    errors.push("Questions are required.");
  }

  if (!Array.isArray(body.questions)) {
    errors.push("Questions must be an array.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}