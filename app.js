import express from "express"
import quizRoutes from "./routes/route.js"

const app = express()
const PORT = 3000


app.use('/resources', quizRoutes)

// Start the server
app.listen(PORT, () => {
     console.log(`Server running at http://localhost:${PORT}`);
});