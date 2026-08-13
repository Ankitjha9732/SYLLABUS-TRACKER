import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      maxlength: [20000, 'Note cannot exceed 20000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ userId: 1, topicId: 1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;