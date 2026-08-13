import Field from '../models/Field.js';

// @desc    List active fields
// @route   GET /api/fields
// @access  Public
export const getFields = async (req, res, next) => {
  try {
    const fields = await Field.find({ isActive: true }).sort({ name: 1 }).lean();
    res.json({
      success: true,
      count: fields.length,
      fields: fields.map((f) => ({
        id: f._id,
        name: f.name,
        slug: f.slug,
        description: f.description,
        icon: f.icon,
        category: f.category,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a field (admin)
// @route   POST /api/fields
// @access  Private/Admin
export const createField = async (req, res, next) => {
  try {
    const { name, slug, description, icon, category, isActive } = req.body;
    const field = await Field.create({
      name,
      slug,
      description: description || '',
      icon: icon || 'Code',
      category: category || 'other',
      isActive: isActive !== false,
    });
    res.status(201).json({ success: true, message: 'Field created', field });
  } catch (error) {
    next(error);
  }
};
