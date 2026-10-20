import { useEffect, useState } from "react";

const API_URL = "/api";

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await request(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onAuthenticated(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="Taskflow">
        <div className="story-topline"><span className="brand-mark">T</span> TASKFLOW</div>
        <div className="story-copy">
          <p className="eyebrow">A little more room to think</p>
          <h1>Make space<br />for what matters.</h1>
          <p className="story-note">Your work, gathered in one calm place. Start with one next step.</p>
        </div>
        <div className="story-art" aria-hidden="true">
          <div className="art-sun" />
          <div className="art-sheet sheet-back"><i /><i /><i /></div>
          <div className="art-sheet sheet-front"><span className="art-check">✓</span><i /><i /><i /></div>
          <div className="art-stamp">ONE<br />THING<br />AT A TIME</div>
        </div>
        <p className="story-footer">A thoughtful place for your everyday list.</p>
      </section>

      <section className="auth-panel">
        <div className="mobile-brand"><span className="brand-mark">T</span> TASKFLOW</div>
        <div className="auth-content">
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="auth-subtitle">
            {mode === "login" ? "Pick up where you left off." : "A clear head starts with a place to put things."}
          </p>

          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Log in</button>
            <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Create account</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            <div className="password-label">
              <label htmlFor="password">Password</label>
              {mode === "register" && <span>8 characters minimum</span>}
            </div>
            <input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
              <span aria-hidden="true">↗</span>
            </button>
          </form>
          <p className="auth-privacy">Your account keeps your task list private.</p>
        </div>
        <span className="panel-index">01 / 02</span>
      </section>
    </main>
  );
}

function dateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function TaskRow({ task, onToggle, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({});

  function beginEditing() {
    setDraft({
      title: task.title,
      description: task.description || "",
      deadline: dateInputValue(task.deadline),
      priority: task.priority || "medium",
      status: task.status || "todo",
    });
    setError("");
    setEditing(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(task._id, { ...draft, deadline: draft.deadline || null });
      setEditing(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className={`task-row ${task.status === "completed" ? "is-complete" : ""}`}>
      {editing ? (
        <form className="task-edit-form" onSubmit={handleSave}>
          <label className="sr-only" htmlFor={`edit-title-${task._id}`}>Task title</label>
          <input id={`edit-title-${task._id}`} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required maxLength={160} />
          <label className="sr-only" htmlFor={`edit-description-${task._id}`}>Description</label>
          <textarea id={`edit-description-${task._id}`} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Add a note (optional)" rows="2" maxLength={1000} />
          <div className="task-edit-fields">
            <label>Status
              <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
                <option value="todo">To do</option><option value="in-progress">In progress</option><option value="completed">Completed</option>
              </select>
            </label>
            <label>Priority
              <select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </label>
            <label>Deadline
              <input type="date" value={draft.deadline} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} />
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="task-edit-actions">
            <button className="edit-save" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
            <button className="edit-cancel" type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <button className="task-check" type="button" aria-label={task.status === "completed" ? "Mark task incomplete" : "Mark task complete"} onClick={() => onToggle(task)}>
            {task.status === "completed" && <span aria-hidden="true">✓</span>}
          </button>
          <div className="task-copy">
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
            <div className="task-meta">
              <span className={`task-status task-status-${task.status}`}>
                {task.status === "in-progress" ? "In progress" : task.status === "completed" ? "Completed" : "To do"}
              </span>
              <span className={`priority priority-${task.priority}`}>{task.priority || "medium"} priority</span>
              {task.deadline && <time dateTime={task.deadline}>Due {new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>}
            </div>
          </div>
          <div className="task-actions">
            <button className="edit-button" type="button" onClick={beginEditing}>Edit</button>
            <button className="icon-button delete-button" type="button" aria-label={`Delete ${task.title}`} title="Delete task" onClick={() => onDelete(task._id)}>×</button>
          </div>
        </>
      )}
    </article>
  );
}

function TaskScreen({ token, user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt:desc");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const [sort, order] = sortBy.split(":");
    const params = new URLSearchParams({ sort, order });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search.trim()) params.set("search", search.trim());

    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError("");
      request(`/tasks?${params}`, { token })
        .then((result) => { if (active) setTasks(result); })
        .catch((requestError) => {
          if (!active) return;
          setError(requestError.message);
          if (requestError.status === 401) onLogout();
        })
        .finally(() => { if (active) setLoading(false); });
    }, search.trim() ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [token, onLogout, statusFilter, search, sortBy, refreshVersion]);

  function refreshTasks() {
    setRefreshVersion((version) => version + 1);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    try {
      const task = await request("/tasks", {
        token,
        method: "POST",
        body: JSON.stringify({ title, description, priority, ...(deadline ? { deadline } : {}) }),
      });
      refreshTasks();
      setTitle("");
      setDescription("");
      setDeadline("");
      setPriority("medium");
    } catch (requestError) {
      setError(requestError.message);
      if (requestError.status === 401) onLogout();
    }
  }

  async function toggleTask(task) {
    const status = task.status === "completed" ? "todo" : "completed";
    try {
      await request(`/tasks/${task._id}`, { token, method: "PUT", body: JSON.stringify({ status }) });
      refreshTasks();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveTask(id, updates) {
    await request(`/tasks/${id}`, {
      token,
      method: "PUT",
      body: JSON.stringify(updates),
    });
    refreshTasks();
  }

  async function deleteTask(id) {
    try {
      await request(`/tasks/${id}`, { token, method: "DELETE" });
      refreshTasks();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const remaining = tasks.filter((task) => task.status !== "completed").length;

  return (
    <main className="workspace">
      <header className="workspace-header">
        <a className="workspace-brand" href="/" aria-label="Taskflow home"><span className="brand-mark">T</span><span>TASKFLOW</span></a>
        <div className="account-menu"><span className="account-email">{user.email}</span><button type="button" className="text-button" onClick={onLogout}>Log out <span aria-hidden="true">↗</span></button></div>
      </header>

      <div className="workspace-grid">
        <section className="task-column">
          <div className="section-heading">
            <div><p className="eyebrow">YOUR PRIVATE SPACE</p><h1>Today, in focus.</h1></div>
            <div className="task-count"><strong>{remaining.toString().padStart(2, "0")}</strong><span>to do</span></div>
          </div>

          <form className="task-composer" onSubmit={handleCreate}>
            <label className="sr-only" htmlFor="new-task">Task title</label>
            <input id="new-task" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs your attention?" required maxLength={160} />
            <label className="sr-only" htmlFor="task-description">Description</label>
            <textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a note (optional)" rows="2" maxLength={1000} />
            <div className="composer-footer">
              <div className="composer-options">
                <label className="sr-only" htmlFor="task-priority">Priority</label>
                <select id="task-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
                  <option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option>
                </select>
                <label className="deadline-control" htmlFor="task-deadline"><span aria-hidden="true">⌁</span><span className="sr-only">Deadline</span><input id="task-deadline" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
              </div>
              <button className="add-button" type="submit"><span aria-hidden="true">+</span> Add task</button>
            </div>
          </form>

          <div className="task-filter-bar">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search tasks</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" maxLength={100} />
            </label>
            <label className="filter-select"><span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All tasks</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="completed">Completed</option>
              </select>
            </label>
            <label className="filter-select"><span>Sort</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="createdAt:desc">Newest</option><option value="createdAt:asc">Oldest</option><option value="deadline:asc">Deadline</option><option value="title:asc">Title A-Z</option><option value="title:desc">Title Z-A</option>
              </select>
            </label>
          </div>

          <div className="list-heading"><h2>YOUR LIST</h2><span>{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span></div>
          {error && <p className="workspace-error" role="alert">{error}</p>}
          {loading ? <p className="list-message">Gathering your tasks...</p> : tasks.length === 0 ? (
            <div className="empty-state"><span className="empty-mark" aria-hidden="true">✳</span><h3>A clear page.</h3><p>Add the first thing on your mind above.</p></div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => <TaskRow key={task._id} task={task} onToggle={toggleTask} onSave={saveTask} onDelete={deleteTask} />)}
            </div>
          )}
        </section>
        <aside className="workspace-aside">
          <div className="aside-date"><span className="aside-sun" aria-hidden="true">◒</span><span>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span></div>
          <div className="aside-note"><p className="eyebrow">A SMALL REMINDER</p><p>Progress is just a few ordinary steps, taken one at a time.</p><span className="note-rule" /></div>
          <div className="aside-bottom"><span>KEEP IT MOVING</span><span>TF — 01</span></div>
        </aside>
      </div>
    </main>
  );
}

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("taskflow-token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("taskflow-user") || "null"); }
    catch { return null; }
  });

  function handleAuthenticated(result) {
    sessionStorage.setItem("taskflow-token", result.token);
    sessionStorage.setItem("taskflow-user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  }

  function handleLogout() {
    sessionStorage.removeItem("taskflow-token");
    sessionStorage.removeItem("taskflow-user");
    setToken(null);
    setUser(null);
  }

  if (!token || !user) return <AuthScreen onAuthenticated={handleAuthenticated} />;
  return <TaskScreen token={token} user={user} onLogout={handleLogout} />;
}