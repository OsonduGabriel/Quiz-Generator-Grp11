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
    const quizId = req.params.id
    try {
        const question = await getQuizById(quizId)

        if(question){
            res.status(200).json(question)
            return;
        }

        res.status(404).json({message: `Quiz with id:${quizId} not found`})

    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Internal server error"})
    }
})

export default route