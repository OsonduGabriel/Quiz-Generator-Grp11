import { Router } from 'express'
import {getAllQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz} from '../services/service.js'

const route = Router()

// GET all quizzes from file storage
route.get('/', async (req, res) => {
    try {
        const questions = await getAllQuizzes()
        res.status(200).json(questions)
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Internal server error"})
    }
   
})

//GET quizzes using a particular ID from the client
route.get('/:id', async (req, res) => {

})

export default route