import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
      maxlength: [80, 'Field name cannot exceed 80 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Field slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [40, 'Icon name cannot exceed 40 characters'],
      default: 'Code',
    },
    category: {
      type: String,
      enum: ['programming', 'exam', 'other'],
      default: 'other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Field = mongoose.model('Field', fieldSchema);

export default Field;
