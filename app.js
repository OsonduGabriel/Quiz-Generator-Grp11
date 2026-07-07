import express from "express"
// import quizRoutes from "./routes/route.js"
import { homeLogic } from "./logic/index.js"

const app = express()
const PORT = 3000

app.get('/', homeLogic)

// app.use('/resources', quizRoutes)

// Start the server
app.listen(PORT, () => {
     console.log(`Server running at http://localhost:${PORT}`);
});