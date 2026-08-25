require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Nail API is running.',
    hasApiKey: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post('/api/chat', async (req, res) => {
  const { prompt, action, ideaTitle, ideaDescription } = req.body || {};
  const finalPrompt = prompt || `Help me think through this idea: ${ideaTitle || 'general idea'}\n${ideaDescription || ''}`;

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      ok: false,
      reply: 'API key not configured yet. Add OPENAI_API_KEY in your .env file to enable the AI helper.'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Nail AI, a helpful idea development assistant for a personal productivity app.'
          },
          {
            role: 'user',
            content: `Context:\nTitle: ${ideaTitle || 'Unspecified idea'}\nDescription: ${ideaDescription || 'No description provided'}\nPrompt: ${finalPrompt}\nRequested action: ${action || 'general guidance'}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI request failed.');
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    res.json({
      ok: true,
      reply: reply || 'I could not generate a response, but your API is connected.'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      reply: `AI request failed: ${error.message}`
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Nail app running at http://localhost:${PORT}`);
});
