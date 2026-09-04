const STORAGE_KEY = "nail_demo_ideas_v1";
const THEME_KEY = "nail_theme_v1";
const REMINDER_CHECK_INTERVAL_MS = 30000;

const seedIdeas = [
  {
    id: crypto.randomUUID(),
    title: "Cybersecurity learning dashboard",
    description: "Build a small site that organizes security lessons, labs, and progress.",
    category: "Technology",
    tags: ["cybersecurity", "web"],
    reminder: "",
    createdAt: new Date().toISOString(),
    pinned: true,
    completed: false
  },
  {
    id: crypto.randomUUID(),
    title: "Python log analyzer",
    description: "Create a tool that reads logs and highlights suspicious login activity.",
    category: "Projects",
    tags: ["python", "security"],
    reminder: "",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    pinned: false,
    completed: false
  },
  {
    id: crypto.randomUUID(),
    title: "Learn one new web concept",
    description: "Spend a focused session understanding a web security concept and save the notes.",
    category: "Learning",
    tags: ["learning"],
    reminder: "",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    pinned: false,
    completed: false
  }
];

let ideas = loadIdeas();
let currentFilter = "all";
let selectedIdeaId = ideas[0]?.id || null;
let editingIdeaId = null;
let activeView = "dashboard";
let lastUndo = null;
let undoTimer = null;

const $ = (id) => document.getElementById(id);

function loadIdeas() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedIdeas;
  } catch {
    return seedIdeas;
  }
}

function saveIdeas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatReminder(iso) {
  if (!iso) return "No reminder";
  const date = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
  }).format(date);
}

function nowLocalDateTime() {
  const now = new Date();
  now.setSeconds(0, 0);
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function enforceReminderMin() {
  $("ideaReminder").setAttribute("min", nowLocalDateTime());
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[m]));
}

function updateStats() {
  $("statIdeas").textContent = ideas.length;
  $("statReminders").textContent = ideas.filter(i => i.reminder && !i.completed).length;
  $("statPinned").textContent = ideas.filter(i => i.pinned).length;
}

function playReminderTone() {
  playTone(880, 0.36);
}

function playTone(frequency, duration) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration - 0.01);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch {
    // Ignore audio failures silently for browsers that block autoplay audio.
  }
}

function playActionSound(isUndo = false) {
  playTone(isUndo ? 660 : 440, 0.14);
}

function showUndoToast(message, undoAction) {
  const toast = $("undoToast");
  $("undoMessage").textContent = message;
  toast.hidden = false;
  toast.classList.add("show");
  lastUndo = undoAction;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    lastUndo = null;
    toast.classList.remove("show");
    toast.hidden = true;
  }, 6000);
}

function undoLastAction() {
  if (!lastUndo) return;
  const undoAction = lastUndo;
  lastUndo = null;
  clearTimeout(undoTimer);
  $("undoToast").classList.remove("show");
  $("undoToast").hidden = true;
  undoAction();
  playActionSound(true);
}

function isReminderDue(idea, nowMs) {
  if (!idea?.reminder || idea.completed) return false;
  const reminderMs = new Date(idea.reminder).getTime();
  if (!Number.isFinite(reminderMs) || reminderMs > nowMs) return false;
  const alertedMs = idea.alertedAt ? new Date(idea.alertedAt).getTime() : 0;
  return !Number.isFinite(alertedMs) || alertedMs < reminderMs;
}

function notifyDueReminders(dueIdeas) {
  if (!dueIdeas.length) return;

  if ("Notification" in window && Notification.permission === "granted") {
    dueIdeas.forEach(idea => {
      new Notification("Nail Reminder", {
        body: `${idea.title} is due now.`,
        tag: `nail-reminder-${idea.id}`
      });
    });
  } else {
    const preview = dueIdeas.slice(0, 3).map(idea => `• ${idea.title}`).join("\n");
    const extra = dueIdeas.length > 3 ? `\n+${dueIdeas.length - 3} more` : "";
    alert(`Reminder due:\n${preview}${extra}`);
  }

  playReminderTone();
}

function checkDueReminders() {
  const nowMs = Date.now();
  const dueIdeas = ideas.filter(idea => isReminderDue(idea, nowMs));
  if (!dueIdeas.length) return;

  notifyDueReminders(dueIdeas);
  const alertedAt = new Date().toISOString();
  dueIdeas.forEach(idea => {
    idea.alertedAt = alertedAt;
  });
  saveIdeas();
  renderIdeas();
  renderReminders();
}

function ideaCard(idea) {
  const tags = (idea.tags || []).slice(0, 3).map(t => `<span class="badge">#${escapeHtml(t)}</span>`).join("");
  const reminder = idea.reminder ? `<span class="badge reminder">◷ ${escapeHtml(formatReminder(idea.reminder))}</span>` : "";
  return `
    <article class="idea-card">
      <div class="idea-card-header">
        <div class="idea-title">${escapeHtml(idea.title)}</div>
        <div class="idea-card-actions">
          <button class="pin-btn ${idea.pinned ? "active" : ""}" data-pin="${idea.id}" title="Pin idea" aria-label="Pin idea">${idea.pinned ? "★" : "☆"}</button>
          <button class="card-action" data-edit="${idea.id}" title="Edit idea" aria-label="Edit idea">Edit</button>
          <button class="card-action delete-action" data-delete="${idea.id}" title="Delete idea" aria-label="Delete idea">Delete</button>
        </div>
      </div>
      <div class="idea-desc">${escapeHtml(idea.description)}</div>
      <div class="idea-meta">
        <span>${escapeHtml(idea.category)}</span>
        <span>${escapeHtml(formatDate(idea.createdAt))}</span>
      </div>
      <div class="badges">${tags}${reminder}</div>
    </article>`;
}

function renderIdeas() {
  const query = $("globalSearch").value.trim().toLowerCase();
  const filtered = ideas
    .filter(i => currentFilter === "all" || i.category === currentFilter)
    .filter(i => !query || `${i.title} ${i.description} ${(i.tags || []).join(" ")}`.toLowerCase().includes(query))
    .sort((a,b) => Number(b.pinned) - Number(a.pinned));

  $("allIdeas").innerHTML = filtered.length
    ? filtered.map(ideaCard).join("")
    : `<div class="empty-state">No ideas match your search.</div>`;

  const recentPool = query
    ? ideas.filter(i => `${i.title} ${i.description} ${(i.tags || []).join(" ")}`.toLowerCase().includes(query))
    : ideas;
  const recent = [...recentPool].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0, 3);
  $("recentIdeas").innerHTML = recent.length
    ? recent.map(ideaCard).join("")
    : `<div class="empty-state">Save your first idea to see it here.</div>`;

  bindIdeaCardActions();
}

function bindIdeaCardActions() {
  document.querySelectorAll("[data-pin]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.pin;
      const idea = ideas.find(i => i.id === id);
      if (!idea) return;
      idea.pinned = !idea.pinned;
      saveIdeas();
      updateStats();
      renderIdeas();
      renderAiIdeas();
    });
  });

  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.edit));
  });

  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => deleteIdea(btn.dataset.delete));
  });
}

function openEditModal(id) {
  const idea = ideas.find(item => item.id === id);
  if (!idea) return;
  editingIdeaId = id;
  $("ideaModalTitle").textContent = "Edit idea";
  $("saveIdeaBtn").textContent = "Update idea";
  $("ideaTitle").value = idea.title;
  $("ideaDescription").value = idea.description;
  $("ideaCategory").value = idea.category;
  $("ideaReminder").value = idea.reminder ? new Date(idea.reminder).toISOString().slice(0, 16) : "";
  $("ideaTags").value = (idea.tags || []).join(", ");
  openModal();
}

function deleteIdea(id) {
  const idea = ideas.find(item => item.id === id);
  if (!idea || !confirm(`Delete “${idea.title}”?`)) return;
  const removedIdea = { ...idea, tags: [...(idea.tags || [])] };
  const removedIndex = ideas.findIndex(item => item.id === id);
  ideas = ideas.filter(item => item.id !== id);
  if (selectedIdeaId === id) selectedIdeaId = ideas[0]?.id || null;
  saveIdeas();
  updateStats();
  renderIdeas();
  renderReminders();
  renderAiIdeas();
  playActionSound();
  showUndoToast("Idea deleted", () => {
    ideas.splice(Math.min(removedIndex, ideas.length), 0, removedIdea);
    selectedIdeaId = removedIdea.id;
    saveIdeas();
    updateStats();
    renderIdeas();
    renderReminders();
    renderAiIdeas();
  });
}

function removeReminder(id) {
  const idea = ideas.find(item => item.id === id);
  if (!idea) return;
  const previousReminder = {
    reminder: idea.reminder,
    completed: idea.completed,
    alertedAt: idea.alertedAt || ""
  };
  idea.reminder = "";
  idea.completed = false;
  idea.alertedAt = "";
  saveIdeas();
  updateStats();
  renderIdeas();
  renderReminders();
  playActionSound();
  showUndoToast("Reminder removed", () => {
    const restoredIdea = ideas.find(item => item.id === id);
    if (!restoredIdea) return;
    Object.assign(restoredIdea, previousReminder);
    saveIdeas();
    updateStats();
    renderIdeas();
    renderReminders();
  });
}

function renderReminders() {
  const list = ideas
    .filter(i => i.reminder)
    .sort((a,b) => new Date(a.reminder)-new Date(b.reminder));

  $("reminderList").innerHTML = list.length
    ? list.map(idea => `
      <div class="reminder-item">
        <button class="check ${idea.completed ? "done" : ""}" data-complete="${idea.id}">${idea.completed ? "✓" : ""}</button>
        <div class="reminder-content">
          <div class="reminder-title">${escapeHtml(idea.title)}</div>
          <div class="reminder-time">${escapeHtml(formatReminder(idea.reminder))}</div>
        </div>
        <span class="badge">${escapeHtml(idea.category)}</span>
        <button class="card-action delete-action" data-remove-reminder="${idea.id}" title="Remove reminder" aria-label="Remove reminder">Remove</button>
      </div>
    `).join("")
    : `<div class="empty-state">No reminders yet. Add one when you save an idea.</div>`;

  document.querySelectorAll("[data-complete]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idea = ideas.find(i => i.id === btn.dataset.complete);
      if (!idea) return;
      idea.completed = !idea.completed;
      saveIdeas();
      updateStats();
      renderReminders();
    });
  });

  document.querySelectorAll("[data-remove-reminder]").forEach(btn => {
    btn.addEventListener("click", () => removeReminder(btn.dataset.removeReminder));
  });
}

function renderAiIdeas() {
  $("aiIdeaList").innerHTML = ideas.length
    ? ideas.map(idea => `
      <button class="ai-idea ${idea.id === selectedIdeaId ? "active" : ""}" data-ai-idea="${idea.id}">
        ${escapeHtml(idea.title)}
        <small>${escapeHtml(idea.category)}</small>
      </button>
    `).join("")
    : `<div class="empty-state">Save an idea first.</div>`;

  document.querySelectorAll("[data-ai-idea]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedIdeaId = btn.dataset.aiIdea;
      renderAiIdeas();
      addBotMessage(`I’m ready. Tell me what you want to explore about “${ideas.find(i => i.id === selectedIdeaId)?.title}”.`);
    });
  });
}

function navigate(view) {
  activeView = view;
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active-view"));
  $(`${view}View`).classList.add("active-view");
  document.querySelectorAll(".nav-item[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  const titles = {
    dashboard: "Good ideas deserve a place.",
    ideas: "Your ideas, in one place.",
    reminders: "Keep the important things on time.",
    ai: "Think with your AI helper.",
    settings: "Make Nail feel like yours."
  };
  $("pageTitle").textContent = titles[view] || titles.dashboard;
  if (view === "reminders") renderReminders();
  if (view === "ideas" || view === "dashboard") renderIdeas();
  if (view === "ai") renderAiIdeas();
}

function applyTheme(themeName) {
  const themes = ["dark", "light", "pro", "human"];
  const theme = themes.includes(themeName) ? themeName : "dark";
  document.body.classList.remove("light-theme", "pro-theme", "human-theme");
  if (theme === "light") document.body.classList.add("light-theme");
  if (theme === "pro") document.body.classList.add("pro-theme");
  if (theme === "human") document.body.classList.add("human-theme");
  localStorage.setItem(THEME_KEY, theme);

  const themeBtn = $("themeBtn");
  const labels = {
    dark: { text: "🌙", title: "Current theme: Dark" },
    light: { text: "☀", title: "Current theme: Light" },
    pro: { text: "◆", title: "Current theme: Pro" },
    human: { text: "◉", title: "Current theme: Human" }
  };
  themeBtn.textContent = labels[theme].text;
  themeBtn.setAttribute("aria-label", labels[theme].title);
  themeBtn.title = labels[theme].title;
}

function cycleTheme() {
  const themes = ["dark", "light", "pro", "human"];
  const current = localStorage.getItem(THEME_KEY) || "dark";
  const next = themes[(themes.indexOf(current) + 1) % themes.length];
  applyTheme(next);
}

function openModal() {
  enforceReminderMin();
  $("ideaModal").classList.add("show");
  setTimeout(() => $("ideaTitle").focus(), 50);
}

function closeModal() {
  $("ideaModal").classList.remove("show");
  $("ideaForm").reset();
  editingIdeaId = null;
  $("ideaModalTitle").textContent = "Save an idea";
  $("saveIdeaBtn").textContent = "Save idea";
}

function addIdea(e) {
  e.preventDefault();
  enforceReminderMin();
  const title = $("ideaTitle").value.trim();
  if (!title) {
    $("ideaTitle").setCustomValidity("Please enter a title for your idea.");
    $("ideaTitle").reportValidity();
    return;
  }
  $("ideaTitle").setCustomValidity("");
  const tags = $("ideaTags").value.split(",").map(s => s.trim()).filter(Boolean);
  const reminderInput = $("ideaReminder").value;
  const reminderDate = reminderInput ? new Date(reminderInput) : null;

  if (reminderDate && reminderDate.getTime() < Date.now()) {
    alert("Reminder must be in the future.");
    return;
  }

  const reminder = reminderDate ? reminderDate.toISOString() : "";

  if (editingIdeaId) {
    const idea = ideas.find(item => item.id === editingIdeaId);
    if (!idea) return;
    const previousReminder = idea.reminder;
    idea.title = title;
    idea.description = $("ideaDescription").value.trim();
    idea.category = $("ideaCategory").value;
    idea.tags = tags;
    idea.reminder = reminder;
    if (previousReminder !== reminder) idea.alertedAt = "";
    if (!reminder) idea.completed = false;
    saveIdeas();
    updateStats();
    renderIdeas();
    renderReminders();
    renderAiIdeas();
    closeModal();
    return;
  }

  const idea = {
    id: crypto.randomUUID(),
    title,
    description: $("ideaDescription").value.trim(),
    category: $("ideaCategory").value,
    tags,
    reminder,
    alertedAt: "",
    createdAt: new Date().toISOString(),
    pinned: false,
    completed: false
  };
  ideas.unshift(idea);
  saveIdeas();
  updateStats();
  renderIdeas();
  renderReminders();
  renderAiIdeas();
  selectedIdeaId = idea.id;
  closeModal();
  navigate("ideas");
}

function addBotMessage(text) {
  const box = $("chatMessages");
  box.insertAdjacentHTML("beforeend", `<div class="message bot"><span class="message-label">Nail AI</span>${escapeHtml(text).replace(/\n/g,"<br>")}</div>`);
  box.scrollTop = box.scrollHeight;
}

function addUserMessage(text) {
  const box = $("chatMessages");
  box.insertAdjacentHTML("beforeend", `<div class="message user">${escapeHtml(text)}</div>`);
  box.scrollTop = box.scrollHeight;
}

function selectedIdea() {
  return ideas.find(i => i.id === selectedIdeaId) || ideas[0];
}

function aiResponse(action, idea) {
  if (!idea) return "Save an idea first, then I can help you with it.";
  const title = idea.title;
  const responses = {
    develop: `For “${title}”, try defining the main user, the problem it solves, and the smallest useful version you could build first.`,
    steps: `Next steps for “${title}”:\n1. Define the goal in one sentence.\n2. Pick the smallest first version.\n3. Write down the first concrete action.\n4. Set a reminder to review progress.`,
    features: `Possible features for “${title}”:\n• Simple first version\n• Search or filtering\n• Progress or status tracking\n• A reminder flow\n• A small feedback loop`,
    related: `This idea may connect to your other ${idea.category.toLowerCase()} ideas. Look for shared topics, tools, or goals and group them into one larger project.`
  };
  return responses[action] || "Try asking me to develop the idea, suggest next steps, or propose features.";
}

async function callAiService(action, idea, customPrompt = "") {
  const prompt = customPrompt || aiResponse(action, idea);
  const payload = {
    action,
    ideaTitle: idea?.title || "",
    ideaDescription: idea?.description || "",
    prompt
  };

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.reply || "AI service unavailable.");
    }
    return data.reply;
  } catch (error) {
    return `The AI service is not ready yet. Add your API key to the .env file and restart the app.\n\n${error.message}`;
  }
}

async function handleAi(action) {
  const idea = selectedIdea();
  const reply = await callAiService(action, idea);
  addBotMessage(reply);
}

document.querySelectorAll(".nav-item[data-view], [data-view]").forEach(btn => {
  btn.addEventListener("click", () => navigate(btn.dataset.view));
});

$("openIdeaBtn").addEventListener("click", openModal);
$("heroSaveBtn").addEventListener("click", openModal);
$("ideasSaveBtn").addEventListener("click", openModal);
$("closeModal").addEventListener("click", closeModal);
$("cancelIdea").addEventListener("click", closeModal);
$("ideaForm").addEventListener("submit", addIdea);

$("globalSearch").addEventListener("input", () => {
  const query = $("globalSearch").value.trim();
  if (query && activeView !== "ideas") {
    navigate("ideas");
    return;
  }
  renderIdeas();
});

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === btn));
    renderIdeas();
  });
});

document.querySelectorAll("[data-ai]").forEach(btn => {
  btn.addEventListener("click", () => handleAi(btn.dataset.ai));
});

$("sendAiBtn").addEventListener("click", async () => {
  const text = $("aiInput").value.trim();
  if (!text) return;
  const idea = selectedIdea();
  addUserMessage(text);
  $("aiInput").value = "";

  const reply = await callAiService("custom", idea, text);
  addBotMessage(reply);
});

$("aiInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("sendAiBtn").click();
});

$("clearCompletedBtn").addEventListener("click", () => {
  ideas = ideas.filter(i => !i.completed);
  saveIdeas();
  updateStats();
  renderReminders();
  renderIdeas();
  renderAiIdeas();
});

$("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset Nail demo data?")) return;
  ideas = seedIdeas.map(x => ({...x, id: crypto.randomUUID()}));
  saveIdeas();
  updateStats();
  renderIdeas();
  renderReminders();
  renderAiIdeas();
});

$("themeBtn").addEventListener("click", cycleTheme);
$("undoBtn").addEventListener("click", undoLastAction);

if ("Notification" in window && Notification.permission === "default") {
  document.addEventListener("click", () => {
    if (Notification.permission === "default") Notification.requestPermission();
  }, { once: true });
}

setInterval(checkDueReminders, REMINDER_CHECK_INTERVAL_MS);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") checkDueReminders();
});

enforceReminderMin();

applyTheme(localStorage.getItem(THEME_KEY) || "dark");

updateStats();
renderIdeas();
renderReminders();
renderAiIdeas();
checkDueReminders();