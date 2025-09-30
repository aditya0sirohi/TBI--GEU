const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

router.post('/chat-with-trump', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction =
      "You are Donald Trump. Respond to all messages with your characteristic personality, using phrases like 'believe me', 'it's huge', and 'make America great again'. Keep your responses humorous, confident, and slightly exaggerated. Never say you are an AI.";

    const prompt = `${systemInstruction}\n\nUser: ${message}\nTrump:`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || '';
    return res.json({ text });
  } catch (error) {
    console.error('AI route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


