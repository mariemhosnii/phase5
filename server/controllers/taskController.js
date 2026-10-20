const Task = require("../models/Task");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { status, search } = req.query;
    const sortFields = ["createdAt", "deadline", "title"];
    const sortField = sortFields.includes(req.query.sort) ? req.query.sort : "createdAt";
    const direction = req.query.order === "asc" ? 1 : -1;
    const filter = { user: req.user._id };

    if (status && status !== "all") {
      if (!["todo", "in-progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid task status filter" });
      }
      filter.status = status;
    }

    if (search !== undefined && typeof search !== "string") {
      return res.status(400).json({ message: "Search must be a single text value" });
    }

    if (search) {
      const term = search.trim();
      if (term.length > 100) {
        return res.status(400).json({ message: "Search must be 100 characters or fewer" });
      }
      if (term) {
        const pattern = new RegExp(escapeRegex(term), "i");
        filter.$or = [{ title: pattern }, { description: pattern }];
      }
    }

    const sort = { [sortField]: direction };
    if (sortField !== "createdAt") sort.createdAt = -1;
    const tasks = await Task.find(filter).sort(sort);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: "Invalid task id" });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      status: req.body.status,
      priority: req.body.priority,
      user: req.user._id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const updates = {};
    ["title", "description", "deadline", "status", "priority"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(400).json({ message: "Invalid task id" });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
