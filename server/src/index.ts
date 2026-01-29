import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

// Load environment variables (like API keys)
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to talk to us
app.use(express.json()); // Parse JSON bodies (like Python's json.loads)

// Simple Health Check Route
app.get('/', (req, res) => {
  res.send('Shelf Scanner API is running! 📚');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});