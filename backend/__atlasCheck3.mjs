import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;

  const subs = await db.collection('subtopics').find({}).project({ roadmapId: 1, topicId: 1, title: 1, createdBy: 1 }).toArray();
  const roadIds = new Set((await db.collection('roadmaps').find({}).project({ _id: 1 }).toArray()).map((r) => r._id.toString()));
  const topicIds = new Set((await db.collection('topics').find({}).project({ _id: 1 }).toArray()).map((t) => t._id.toString()));

  let orphanRoad = 0, orphanTopic = 0, valid = 0;
  for (const s of subs) {
    if (!roadIds.has((s.roadmapId || '').toString())) orphanRoad++;
    if (!topicIds.has((s.topicId || '').toString())) orphanTopic++;
    if (roadIds.has((s.roadmapId || '').toString()) && topicIds.has((s.topicId || '').toString())) valid++;
  }
  console.log('subtopics total:', subs.length);
  console.log('orphan roadmapId:', orphanRoad, ' orphan topicId:', orphanTopic, ' valid:', valid);
  const sample = subs.filter((s) => roadIds.has((s.roadmapId || '').toString()) && topicIds.has((s.topicId || '').toString())).slice(0, 5);
  for (const s of sample) console.log('sample valid sub:', (s.roadmapId || '').toString().slice(0, 8), (s.topicId || '').toString().slice(0, 8), s.title);

  const indexes = await db.collection('progresses').indexes();
  console.log('progresses indexes:', JSON.stringify(indexes, null, 0));

  const userRoads = await db.collection('roadmaps').find({ linked: true }).countDocuments();
  console.log('linked roadmaps:', userRoads);
  await mongoose.disconnect();
};

main().then(() => process.exit(0)).catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});