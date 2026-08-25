const STORAGE_KEY = "nail_demo_ideas_v1";

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

  const recent = [...ideas].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0, 3);
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
  ideas = ideas.filter(item => item.id !== id);
  if (selectedIdeaId === id) selectedIdeaId = ideas[0]?.id || null;
  saveIdeas();
  updateStats();
  renderIdeas();
  renderReminders();
  renderAiIdeas();
}

function removeReminder(id) {
  const idea = ideas.find(item => item.id === id);
  if (!idea) return;
  idea.reminder = "";
  idea.completed = false;
  saveIdeas();
  updateStats();
  renderIdeas();
  renderReminders();
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

function openModal() {
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
  const tags = $("ideaTags").value.split(",").map(s => s.trim()).filter(Boolean);
  const reminder = $("ideaReminder").value ? new Date($("ideaReminder").value).toISOString() : "";

  if (editingIdeaId) {
    const idea = ideas.find(item => item.id === editingIdeaId);
    if (!idea) return;
    idea.title = $("ideaTitle").value.trim();
    idea.description = $("ideaDescription").value.trim();
    idea.category = $("ideaCategory").value;
    idea.tags = tags;
    idea.reminder = reminder;
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
    title: $("ideaTitle").value.trim(),
    description: $("ideaDescription").value.trim(),
    category: $("ideaCategory").value,
    tags,
    reminder,
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

$("globalSearch").addEventListener("input", renderIdeas);

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

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  $("themeBtn").textContent = document.body.classList.contains("light-theme") ? "☀" : "☾";
});

updateStats();
renderIdeas();
renderReminders();
renderAiIdeas();