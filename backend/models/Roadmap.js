import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [40, 'Icon name cannot exceed 40 characters'],
      default: 'Map',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: ['mern', 'dsa', 'pcm', 'pcb', 'python', 'ml'],
      lowercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sourceRoadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      default: null,
    },
    linked: {
      type: Boolean,
      default: false,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

roadmapSchema.index({ userId: 1, order: 1 });
roadmapSchema.index({ subject: 1, isTemplate: 1 });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

export default Roadmap;
