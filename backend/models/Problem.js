import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: [200, 'Problem title cannot exceed 200 characters'],
    },
    link: {
      type: String,
      trim: true,
      maxlength: [500, 'Link cannot exceed 500 characters'],
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [2000, 'Note cannot exceed 2000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

problemSchema.index({ userId: 1, topicId: 1, createdAt: 1 });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;