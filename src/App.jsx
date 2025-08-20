import { useEffect, useMemo, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | active | completed

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tasks");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const hasTasks = tasks.length > 0;
  const numCompleted = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );
  const progress = hasTasks
    ? Math.round((numCompleted / tasks.length) * 100)
    : 0;

  const visibleTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  function handleSubmit(e) {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value) return;

    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTaskId ? { ...t, title: value } : t))
      );
      setEditingTaskId(null);
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        title: value,
        completed: false,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    setInputValue("");
  }

  function beginEdit(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setInputValue(task.title);
    setEditingTaskId(taskId);
  }

  function toggleComplete(taskId) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  }

  function removeTask(taskId) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
      setInputValue("");
    }
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-white text-slate-800">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl backdrop-blur">
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <h1 className="text-center text-3xl font-extrabold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                To‑Do List
              </span>
            </h1>
            <p className="text-center text-sm text-slate-500">
              Organize your tasks. Stay focused. Get things done.
            </p>
            <p>Welcome to the To-Do List</p>

            <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={editingTaskId ? "Update task…" : "Add a new task…"}
                className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-transparent focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400 transition"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-sky-700 active:from-indigo-800 active:to-sky-800 disabled:opacity-50 disabled:saturate-50 transition"
                disabled={!inputValue.trim()}
              >
                {editingTaskId ? "Update" : "Add"}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-xl ring-1 ring-slate-200 bg-white/80 p-1 text-sm shadow-sm">
                <button
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filter === "all"
                      ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  type="button"
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filter === "active"
                      ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  type="button"
                  onClick={() => setFilter("active")}
                >
                  Active
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filter === "completed"
                      ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  type="button"
                  onClick={() => setFilter("completed")}
                >
                  Completed
                </button>
              </div>

              <button
                type="button"
                onClick={clearCompleted}
                className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
              >
                Clear completed
              </button>
            </div>

            {hasTasks && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>
                    Completed {numCompleted} of {tasks.length}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-sky-600 transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              {!hasTasks && (
                <div className="text-center text-slate-500 text-sm rounded-xl border border-dashed border-slate-300 bg-white/60 p-8">
                  <div className="text-3xl mb-2">🗒️</div>
                  <p>No tasks yet. Add your first one above.</p>
                </div>
              )}

              <ul className="space-y-2">
                {visibleTasks.map((task) => (
                  <li
                    key={task.id}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-3 shadow-sm hover:bg-white hover:shadow-md transition hover:-translate-y-0.5"
                  >
                    <input
                      id={`task-${task.id}`}
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                      className="size-4 accent-sky-600"
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`flex-1 text-sm ${
                        task.completed
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </label>
                    <div className="flex items-center gap-2 opacity-80">
                      <button
                        type="button"
                        onClick={() => beginEdit(task.id)}
                        className="text-xs text-indigo-600 hover:underline"
                        aria-label="Edit task"
                      >
                        Edit
                      </button>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={() => removeTask(task.id)}
                        className="text-xs text-rose-600 hover:underline"
                        aria-label="Delete task"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="mt-8 text-center text-xs text-slate-500">
              Tasks are saved to your browser storage
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
