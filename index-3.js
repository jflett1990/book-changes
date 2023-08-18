const express = require('express');
const bodyParser = require('body-parser');
const openai = require('openai');
const path = require('path');
const fs = require('fs');

const OPENAI_API_KEY = 'const mySecret = process.env['open']'; // Replace with your OpenAI API key
const openaiInstance = new openai(OPENAI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files, if needed

app.post('/ask-gpt', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Send the prompt to OpenAI's GPT
    const gptResponse = await openaiInstance.completion.create({
      engine: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150
    });

    const reading = gptResponse.data.choices[0].text;

    // Send the reading back to the frontend
    res.json({ reading });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

// Route to serve the frontend HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
