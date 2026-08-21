import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Topic must belong to a section'],
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      maxlength: [120, 'Topic title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    optional: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    revision: {
      type: String,
      enum: ['none', 'first', 'second', 'final'],
      default: 'none',
    },
    weak: {
      type: Boolean,
      default: false,
    },
    practice: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

topicSchema.index({ sectionId: 1, order: 1 });
topicSchema.index({ roadmapId: 1, order: 1 });
topicSchema.index({ isCustom: 1, createdBy: 1 });

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;
