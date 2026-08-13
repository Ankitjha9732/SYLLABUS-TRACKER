import Task from '../models/Task.js';

// @desc    Get tasks for the user, optionally filtered by date
// @route   GET /api/tasks?date=yyyy-mm-dd
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.date) query.date = req.query.date;

    const tasks = await Task.find(query).sort({ completed: 1, order: 1, createdAt: 1 });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, roadmapId, date } = req.body;
    const order = await Task.countDocuments({ userId: req.user.id, date: date || '' });

    const task = await Task.create({
      userId: req.user.id,
      title,
      description: description || '',
      roadmapId: roadmapId || null,
      date: date || '',
      order,
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const patchable = ['title', 'description', 'roadmapId', 'date'];
    patchable.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });
    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task completion
// @route   PUT /api/tasks/:id/toggle
// @access  Private
export const toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
