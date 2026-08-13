import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [120, 'Resource title cannot exceed 120 characters'],
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['video', 'documentation', 'article', 'github', 'other'],
      default: 'other',
    },
  },
  { _id: true }
);

const subTopicSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'SubTopic must belong to a topic'],
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'SubTopic title is required'],
      trim: true,
      maxlength: [120, 'SubTopic title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    estimatedTime: {
      type: String,
      trim: true,
      maxlength: [30, 'Estimated time cannot exceed 30 characters'],
      default: '',
    },
    resources: {
      type: [resourceSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

subTopicSchema.index({ topicId: 1, isCustom: 1 });
subTopicSchema.index({ isCustom: 1, createdBy: 1 });

const SubTopic = mongoose.model('SubTopic', subTopicSchema);

export default SubTopic;