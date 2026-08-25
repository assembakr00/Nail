# 📌 Nail

Nail is a personal idea-saving and reminder app for capturing thoughts, organizing them by category, and using a lightweight AI helper to develop ideas further.

Catch the idea. Nail it down. Build on it later. 💡

**🔗 Live demo:** https://assembakr00.github.io/Nail/ — see the note in [Try it out](#-try-it-out) before you go looking for the AI Helper there!

## ✨ Features

- 💾 Save and organize ideas
- 🔍 Search and filter by category
- 📌 Pin important ideas
- ⏰ Add reminder dates
- ✅ Mark reminder items as complete
- 🤖 AI helper through a server-side API route
- ⚡ Local browser storage for a fast demo workflow
- ✏️ Edit and delete ideas
- 🗑️ Remove scheduled reminders without deleting the idea

## 🛠️ Tech stack

- HTML, CSS, JavaScript
- Express server
- OpenAI-compatible chat completions API (replaceable with Hugging Face)
- `dotenv` for environment variables

## 🚀 Try it out

You've got two ways to run Nail — pick whichever fits what you want to see:

### Option 1: GitHub Pages (fastest, but read this first ⚠️)

Just open the live link: **https://assembakr00.github.io/Nail/**

GitHub Pages only serves static files — it can't run the Express backend (`server.js`). So the note-saving, reminders, pinning, and search all work great straight out of the box, since those run entirely in your browser. But the **AI Helper won't respond** on this link, because there's no server there to handle the `/api/chat` request it needs. If you want the AI side working, use Option 2 below.

### Option 2: Run it locally (full experience, AI included 🤖)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

   On Windows:

   ```bash
   copy .env.example .env
   ```

3. Add your API provider token in the `.env` file. Do not commit this file:

   ```env
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-4o-mini
   ```

4. Start the app:

   ```bash
   npm start
   ```

5. Open your browser at:

   ```text
   http://localhost:3000
   ```

This spins up the Express server locally, so the AI Helper actually has something to talk to. 🎉

## 🔑 Environment variables

Create a `.env` file with values like:

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

> ⚠️ Do not commit your real API key. Keep `.env` local and make sure it is ignored by Git.

## 🧠 API behavior

The app includes a small Express backend that accepts AI requests and forwards them to the configured AI provider using your server-side API key. The browser never receives the key.

If no key is configured yet, the app still runs in a safe fallback mode and returns a message telling you to add the key — no crashes, no confusion.

## 📁 Project structure

```text
.
├── app.js
├── index.html
├── style.css
├── server.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── assets/
    └── logo.svg
```

## 🧩 Planned work for a real production app

The current version is a local browser demo. These are the main pieces still missing or planned before Nail becomes a complete multi-user application:

- 🗄️ Database storage for ideas, reminders, AI conversations, and accounts
- 🔐 Authentication with secure sessions and user-specific authorization
- 👤 Login page, sign-up page, password reset, and account settings
- 🔄 Server-side idea and reminder CRUD endpoints instead of localStorage-only persistence
- 🚧 Custom 404 page plus consistent 4xx/5xx error pages
- 🔔 Real scheduled notifications and reminder delivery
- 🛡️ Input validation, rate limits, logging, monitoring, automated tests, and deployment configuration
- 🤖 AI provider configuration, usage limits, and abuse protection

localStorage is still useful for the demo, but it should not be the permanent source of truth for a real app. A database will allow secure persistence and syncing across devices.

## 📝 Notes

This project is designed so you can plug in your own API key later without changing the app structure. All sensitive values should stay in `.env` and never be hardcoded into source files.
