import express from "express";
import router from "./routes/route.js";

const app = express();
console.log("THIS IS THE NEW APP");
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", router);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Quiz Generator API",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});