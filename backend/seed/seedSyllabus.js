import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Module from '../models/Module.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import { syllabusData } from './syllabusData.js';

dotenv.config();

/**
 * Seeds the official MERN syllabus into MongoDB.
 * The script is idempotent: official content (isCustom:false) is wiped and
 * re-inserted every run, so running it multiple times never duplicates entries.
 * Custom user content and progress records are untouched.
 */
const seed = async () => {
  try {
    await connectDB();

    console.log('Clearing previous official syllabus...');
    await Module.deleteMany({ isCustom: false, createdBy: null });
    await Topic.deleteMany({ isCustom: false, createdBy: null });
    await SubTopic.deleteMany({ isCustom: false, createdBy: null });

    console.log(`Seeding ${syllabusData.length} modules...`);
    let moduleCount = 0;
    let topicCount = 0;
    let subTopicCount = 0;

    for (let mi = 0; mi < syllabusData.length; mi += 1) {
      const mod = syllabusData[mi];
      const module = await Module.create({
        title: mod.title,
        description: mod.description,
        order: mi,
        isCustom: false,
        createdBy: null,
      });
      moduleCount += 1;

      for (let ti = 0; ti < mod.topics.length; ti += 1) {
        const topic = mod.topics[ti];
        const savedTopic = await Topic.create({
          moduleId: module._id,
          title: topic.title,
          description: topic.description || '',
          order: ti,
          isCustom: false,
          createdBy: null,
        });
        topicCount += 1;

        for (let si = 0; si < topic.subtopics.length; si += 1) {
          const st = topic.subtopics[si];
          await SubTopic.create({
            topicId: savedTopic._id,
            title: st.title,
            description: st.description || '',
            difficulty: st.difficulty || 'medium',
            estimatedTime: st.estimatedTime || '',
            resources: st.resources || [],
            order: si,
            isCustom: false,
            createdBy: null,
          });
          subTopicCount += 1;
        }
      }
    }

    console.log('Seeding complete:');
    console.log(`  Modules:   ${moduleCount}`);
    console.log(`  Topics:    ${topicCount}`);
    console.log(`  SubTopics: ${subTopicCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();