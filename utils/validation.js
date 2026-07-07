// validation.js
// input validation for quiz questions, quizzes, and submissions

export function validateQuestion(questionObj, index) {
  if (index === undefined) {
    index = 0;
  }

  var errors = [];

  if (!questionObj || typeof questionObj !== 'object') {
    errors.push('Question at index ' + index + ' must be a valid object.');
    return { valid: false, errors: errors };
  }

  // check the question text
  if (!questionObj.question || typeof questionObj.question !== 'string' || questionObj.question.trim() === '') {
    errors.push('Question ' + (index + 1) + ': "question" text is required and must be a string.');
  }

  // check the options list
  if (!questionObj.options || !Array.isArray(questionObj.options)) {
    errors.push('Question ' + (index + 1) + ': "options" is required and must be an array.');
  } else {
    if (questionObj.options.length < 2) {
      errors.push('Question ' + (index + 1) + ': needs at least 2 options.');
    }

    // checking every option one at a time with a regular loop
    var allStringsOk = true;
    for (var i = 0; i < questionObj.options.length; i++) {
      var option = questionObj.options[i];
      if (typeof option !== 'string' || option.trim() === '') {
        allStringsOk = false;
      }
    }
    if (!allStringsOk) {
      errors.push('Question ' + (index + 1) + ': all options must be non-empty strings.');
    }
  }

  var isValid = false;
  if (errors.length === 0) {
    isValid = true;
  }

  return { valid: isValid, errors: errors };
}

export function validateQuiz(quiz) {
  var errors = [];

  if (!quiz || typeof quiz !== 'object') {
    errors.push('Quiz data must be a valid object.');
    return { valid: false, errors: errors };
  }

  if (!quiz.title || typeof quiz.title !== 'string' || quiz.title.trim() === '') {
    errors.push('Quiz "title" is required and must be text.');
  }

  if (!quiz.questions || !Array.isArray(quiz.questions)) {
    errors.push('Quiz "questions" property is required and must be an array.');
  } else if (quiz.questions.length === 0) {
    errors.push('A quiz must have at least one question.');
  } else {
    // check each question one at a time
    for (var i = 0; i < quiz.questions.length; i++) {
      var result = validateQuestion(quiz.questions[i], i);
      if (!result.valid) {
        for (var j = 0; j < result.errors.length; j++) {
          errors.push(result.errors[j]);
        }
      }
    }
  }

  var isValid = false;
  if (errors.length === 0) {
    isValid = true;
  }

  return { valid: isValid, errors: errors };
}

export function validateSubmission(submission, originalQuiz) {
  var errors = [];

  if (!submission || typeof submission !== 'object') {
    errors.push('Submission data must be a valid object.');
    return { valid: false, errors: errors };
  }

  if (!originalQuiz || !Array.isArray(originalQuiz.questions)) {
    errors.push('System error: original quiz reference missing for verification.');
    return { valid: false, errors: errors };
  }

  if (!submission.answers || !Array.isArray(submission.answers)) {
    errors.push('Submission must contain an "answers" array.');
    return { valid: false, errors: errors };
  }

  var expectedCount = originalQuiz.questions.length;
  var actualCount = submission.answers.length;
  if (actualCount !== expectedCount) {
    errors.push('You answered ' + actualCount + ' questions, but the quiz has ' + expectedCount + ' questions.');
  }

  var isValid = false;
  if (errors.length === 0) {
    isValid = true;
  }

  return { valid: isValid, errors: errors };
}