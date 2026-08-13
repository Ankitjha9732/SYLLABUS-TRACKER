import Goal from '../models/Goal.js';

// @desc    Get all goals for the user (optionally filter by completed)
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.completed === 'true') query.completed = true;
    if (req.query.completed === 'false') query.completed = false;

    const goals = await Goal.find(query).sort({ completed: 1, order: 1, createdAt: 1 });
    res.json({ success: true, count: goals.length, goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const { title, description, roadmapId, targetDate } = req.body;
    const order = await Goal.countDocuments({ userId: req.user.id });

    const goal = await Goal.create({
      userId: req.user.id,
      title,
      description: description || '',
      roadmapId: roadmapId || null,
      targetDate: targetDate ? new Date(targetDate) : null,
      order,
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const patchable = ['title', 'description', 'roadmapId', 'targetDate'];
    patchable.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'targetDate') goal[field] = req.body[field] ? new Date(req.body[field]) : null;
        else goal[field] = req.body[field];
      }
    });
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle goal completion
// @route   PUT /api/goals/:id/toggle
// @access  Private
export const toggleGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    goal.completed = !goal.completed;
    goal.completedAt = goal.completed ? new Date() : null;
    await goal.save();

    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder goals
// @route   PUT /api/goals/reorder
// @access  Private
export const reorderGoals = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    const goals = await Goal.find({ userId: req.user.id });
    const ownedIds = new Set(goals.map((g) => String(g._id)));
    const valid = orderedIds.every((id) => ownedIds.has(String(id)));
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid goal ids' });

    await Promise.all(
      orderedIds.map((id, index) => Goal.updateOne({ _id: id, userId: req.user.id }, { $set: { order: index } }))
    );
    res.json({ success: true, message: 'Goals reordered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};
