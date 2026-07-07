import express from 'express'
import {getAllQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz} from '../services/service.js'

const route = express.Router()

// GET quiz
route.get('/', (req, res) => {
    const quizzes = getAllQuizzes()
    res.status(200).json(quizzes)

})

export default route