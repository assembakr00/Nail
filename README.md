#  Nail

Nail is a personal idea-saving and reminder app for capturing thoughts, organizing them by category, and using a lightweight AI helper to develop ideas further.

Catch the idea. Nail it down. Build on it later.

try it in https://assembakr00.github.io/Nail/ also see the note in [Try it out](#-try-it-out) before you go looking for the AI Helper there!

##  Features(i have to be formal idk why)

-  Save and organize ideas
-  Search and filter by category
-  Pin important ideas
-  Add reminder dates
-  Mark reminder items as complete
-  AI helper through a server-side API route
-  Local browser storage for a fast demo workflow
-  Edit and delete ideas
-  Remove scheduled reminders without deleting the idea


### Problem to explore(pls read it i think its useful)

People often get useful ideas while commuting, walking, working, or falling asleep. The current options are usually inconvenient or disconnected: a notes app, a voice memo, a message to yourself, a screenshot, or a paper note. Many ideas are lost because capturing them takes too much effort, and the ideas that are captured are rarely revisited.
and
People often get useful ideas during ordinary parts of the day, but those thoughts are easy to lose or forget. Existing tools can store notes, but capturing an idea, developing it, and remembering to return to it are often separate activities. Nail is exploring how to connect those parts without making the user maintain a complicated system.

Nail is exploring a focused workflow:
which i hope is Capture a rough thought quickly, develop it with AI, and remember to act on it later.

This makes Nail a portfolio project first and a possible product later. The first target users are students, developers, and creative people who regularly have ideas but struggle to return to them.




## What i used

ofc firstly HTML, CSS, JavaScript
and Express server
and OpenAI-compatible chat completions API (replaceable with Hugging Face)
and `dotenv` for environment variables

## 🚀 Try it out

You've got two ways to run Nail — pick whichever fits what you want to see:

### Option 1: GitHub Pages (fastest, but read this first!!!!!! ⚠️)

Just open the live link: **https://assembakr00.github.io/Nail/**

GitHub Pages only serves static files so the ai helper dosent work and i made a solution for that in option 2 btw


### Option 2: Run it locally (if u want ai also its very formmated bec ai helped here till the  api behaviour part)

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

also ofc Do not commit your real API key. Keep `.env` local and make sure it is ignored by Git that is if u fork this

##  API behavior

The app includes a small Express backend that accepts AI requests and forwards them to the configured AI provider using your server-side API key. The browser never receives the key.

If no key is configured yet, the app still runs in a safe fallback mode and returns a message telling you to add the key so no crashes, no mental crisis dw

## Notes
hey if u liked this project and want to see my plans and some formal bornig stuff but half cool i think check extra-docs.md in the files it has some cool stuff also
This project is designed so you can plug in your own API key later without changing the app structure. All sensitive values should stay in `.env` and never be hardcoded into source files.

              (BTW i know u guys will notice the lots of Emojis and that ai wrote everything but nah idk how do write Emojis (ofc) so ai just added it looks vibecoded or unprof. but idc i like them and thx for reading see u soon!!)
