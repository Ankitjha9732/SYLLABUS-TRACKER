import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('connected:', mongoose.connection.host);
  const db = mongoose.connection.db;
  const roads = await db
    .collection('roadmaps')
    .find({})
    .project({ title: 1, subject: 1, isTemplate: 1, linked: 1, sourceRoadmapId: 1 })
    .toArray();
  console.log('roadmaps:', roads.length);
  for (const r of roads) {
    console.log('-', r.subject, r.isTemplate ? 'TEMPLATE' : 'linked', JSON.stringify(r.title).slice(0, 60));
  }
  const topics = await db.collection('topics').countDocuments();
  const subs = await db.collection('subtopics').countDocuments();
  const progresses = await db.collection('progresses').countDocuments();
  console.log('topics:', topics, 'subtopics:', subs, 'progresses:', progresses);
  await mongoose.disconnect();
};

main().then(() => process.exit(0)).catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});