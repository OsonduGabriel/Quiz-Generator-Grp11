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

        return res.status(404).json({message: `Quiz with id: ${quizId} not found`})

    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Internal server error"})
    }
})

//create a new Quiz from data collected from client
route.post('/', async (req, res) => {
    const submittedData = req.body
    try {
        const newQuiz = await createQuiz(submittedData)
        res.status(201).json(newQuiz)

    } catch (error) {
        console.error(error)
        if (error.name === "ValidationError") {
            return res.status(400).json({message: error.message});
        }
       return res.status(500).json({message: "Internal server error"})
    }
})

// Update an existing quiz using its id
route.put('/:id', async (req, res) => {
    const quizId = req.params.id
    const updatedData = req.body

    try {
        const updatedQuiz = await updateQuiz(quizId, updatedData)

        if(updatedQuiz){
            res.status(200).json(updatedQuiz)
            return;
        }

        return res.status(404).json({message: `Quiz with id: ${quizId} not found`})
    } catch (error) {
        console.error(error)
        if (error.name === "ValidationError") {
            return res.status(400).json({message: error.message});
        }
       return res.status(500).json({message: "Internal server error"})
    }

})

// delete a quiz from data/questions.json using the quiz id
route.delete("/:id", async (req, res) => {
    const quizId = req.params.id

    try {
        const deletedQuiz = await deleteQuiz(quizId)

        if(deletedQuiz){
            return res.status(200).json({message: "Quiz successfully deleted"})
        }

        return res.status(404).json({message: `Quiz with id: ${quizId} not found` })
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

export default route
