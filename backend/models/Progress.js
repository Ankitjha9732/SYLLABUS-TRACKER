import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
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
    subTopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubTopic',
      default: null,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One record per (user, topic) for topic-level completion plus one per
// (user, topic, subtopic) when a topic is tracked at the subtopic level.
progressSchema.index({ userId: 1, topicId: 1, subTopicId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;