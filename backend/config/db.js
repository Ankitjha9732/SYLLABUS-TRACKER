import mongoose from 'mongoose';

/**
 * Progress was historically keyed uniquely on (userId, topicId). Since
 * subtopic-level progress shares the same topicId, that index must be
 * replaced with a (userId, topicId, subTopicId) index before upserts can
 * create subtopic records. Safe to run every boot; no-ops when absent.
 */
const ensureProgressIndexes = async () => {
  try {
    const col = mongoose.connection.collection('progresses');
    const existing = await col.indexes();
    const legacy = existing.find((i) => i.name === 'userId_1_topicId_1');
    if (legacy) {
      await col.dropIndex('userId_1_topicId_1');
      console.log('Dropped legacy progress index userId_1_topicId_1');
    }
  } catch (error) {
    if (error?.codeName !== 'IndexNotFound') {
      console.warn(`Progress index migration warning: ${error.message}`);
    }
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await ensureProgressIndexes();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;