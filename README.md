# 📌 Nail

Nail is a personal idea-saving and reminder app for capturing thoughts, organizing them by category, and using a lightweight AI helper to develop ideas further.

Catch the idea. Nail it down. Build on it later.

** Live demo:** https://assembakr00.github.io/Nail/ — see the note in [Try it out](#-try-it-out) before you go looking for the AI Helper there!

## ✨ Features

-  Save and organize ideas
-  Search and filter by category
-  Pin important ideas
-  Add reminder dates
-  Mark reminder items as complete
-  AI helper through a server-side API route
-  Local browser storage for a fast demo workflow
-  Edit and delete ideas
-  Remove scheduled reminders without deleting the idea

## Product direction and market research

### Problem to explore

People often get useful ideas while commuting, walking, working, or falling asleep. The current options are usually inconvenient or disconnected: a notes app, a voice memo, a message to yourself, a screenshot, or a paper note. Many ideas are lost because capturing them takes too much effort, and the ideas that are captured are rarely revisited.

Nail is exploring a focused workflow:

> Capture a rough thought quickly, develop it with AI, and remember to act on it later.

This makes Nail a portfolio project first and a possible product later. The first target users are students, developers, and creative people who regularly have ideas but struggle to return to them.

### Competitor and substitute review

This is an initial qualitative review, recorded on October 13, 2026. It compares the problem Nail is exploring rather than claiming that Nail is better than established products.

| Alternative | What it does well | Opportunity for Nail |
| --- | --- | --- |
| Notion | Flexible notes, documents, databases, and project organization | Offer a faster idea-capture flow with less setup |
| Apple Notes, Google Keep, and OneNote | Quick general note capture and broad device support | Connect a rough note to AI development and a follow-up reminder |
| Todoist and other task apps | Tasks, due dates, recurring reminders, and planning | Keep the original idea visible instead of reducing it to only a task |
| Obsidian and other knowledge tools | Linking ideas and building a personal knowledge base | Make the first capture simple for people who do not want to design a whole system |
| Voice memos, screenshots, paper notes, and self-messages | Available immediately and often free | Make one idea easier to save, organize, revisit, and turn into action |

The main competition is not only another app. It is also the existing habit of saying, "I will remember this," and then losing the idea.

### Product hypothesis

Nail should not try to replace every notes, task, or knowledge-management app. Its clearer position is:

> Nail helps people turn fleeting thoughts into ideas they can actually return to.

The AI helper is useful for creative and developer workflows, but reminders keep the product useful even when someone does not need AI. A separate reminders product should wait until testing shows that reminders are the main reason people return.

### Explore ideas concept

The **Explore ideas** action could eventually open a guided idea-template page instead of only showing the idea library. The page could help a rough thought become a clearer project by asking for:

- The problem or opportunity
- Who it is for
- The main idea
- Useful features
- The smallest first version
- The next action and a reminder

This should be built as a later product feature after the current dashboard flow is stable. The first version can be a simple template page, with AI suggestions added after the basic workflow feels useful without AI.

### Validation plan

Before investing in paid hosting, a database, or a business model, test Nail with three to five people:

1. Ask them to save a real idea without explaining every feature.
2. Watch where they hesitate or get confused.
3. Ask what they expected to happen after saving it.
4. Check whether they return to the app later without being reminded.
5. Ask what they currently use: notes, voice memos, messages, paper, or another app.

Useful questions are:

- What would you use Nail for?
- What part felt slow or confusing?
- Would you open it again next week?
- What would make this easier than your current notes app?

The first success metric is not downloads or revenue. It is whether a small group repeatedly captures and revisits ideas. If that behavior is real, Nail can later explore optional paid AI usage, advanced reminders, or other premium features.

## 🛠️ Tech stack

- HTML, CSS, JavaScript
- Express server
- OpenAI-compatible chat completions API (replaceable with Hugging Face)
- `dotenv` for environment variables

## 🚀 Try it out

You've got two ways to run Nail — pick whichever fits what you want to see:

### Option 1: GitHub Pages (fastest, but read this first!!!!!! ⚠️)

Just open the live link: **https://assembakr00.github.io/Nail/**

GitHub Pages only serves static files — it can't run the Express backend (server.js). So the note-saving, reminders, pinning, and search all work great straight out of the box, since those run entirely in your browser. But the **AI Helper won't respond** on this link, because there's no server there to handle the `/api/chat` request it needs. If you want the AI side working, use Option 2 below.

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

This spins up the Express server locally, so the AI Helper actually has something to talk to.

##  Environment variables

Create a `.env` file with values like:

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

> ⚠️ Do not commit your real API key. Keep `.env` local and make sure it is ignored by Git.

##  API behavior

The app includes a small Express backend that accepts AI requests and forwards them to the configured AI provider using your server-side API key. The browser never receives the key.

If no key is configured yet, the app still runs in a safe fallback mode and returns a message telling you to add the key — no crashes, no confusion.

## 📁 Project structure

```text
.
├── Public/
│   ├── app.js
│   ├── index.html
│   ├── style.css
│   └── assets/
│       └── logo.svg
├── server/
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

##  Planned work for a real production app

The current version is a local browser demo. These are the main pieces still missing or planned before Nail becomes a complete multi-user application:

-  Database storage for ideas, reminders, AI conversations, and accounts
-  Authentication with secure sessions and user-specific authorization
-  Login page, sign-up page, password reset, and account settings
-  Server-side idea and reminder CRUD endpoints instead of localStorage-only persistence
-  Guided Explore Ideas template page for turning rough thoughts into project plans
-  Custom 404 page plus consistent 4xx/5xx error pages
-  Real scheduled notifications and reminder delivery
-  Input validation, rate limits, logging, monitoring, automated tests, and deployment configuration
-  AI provider configuration, usage limits, and abuse protection

localStorage is still useful for the demo, but it should not be the permanent source of truth for a real app. A database will allow secure persistence and syncing across devices.

## Notes

This project is designed so you can plug in your own API key later without changing the app structure. All sensitive values should stay in `.env` and never be hardcoded into source files.

              (BTW i know u guys will notice the lots of Emojis and that ai wrote everything but nah idk how do write Emojis (ofc) so ai just added it looks vibecoded or unprof. but idc i like them and thx for reading see u soon!!)
