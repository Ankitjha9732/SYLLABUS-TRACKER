import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Roadmap from '../models/Roadmap.js';
import Section from '../models/Section.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import {
  buildMernTemplate,
  buildDsaTemplate,
  buildPcmTemplate,
  buildPcbTemplate,
} from './seedData.js';
import { buildPythonBackendTemplate } from './pythonBackendData.js';
import { buildMachineLearningTemplate } from './machineLearningData.js';
import { buildGateTemplate } from './gateData.js';

dotenv.config();

/**
 * Idempotent seeder: recreates each subject's template roadmap (and its
 * Section -> Topic -> SubTopic content) if it doesn't already exist or is
 * missing topics/subtopics.
 */
const createTemplate = async (tpl) => {
  const expectedSections = tpl.sections.filter((s) => !s.optional).length;
  const expectedTopics = tpl.sections.reduce((n, s) => n + (s.topics || []).length, 0);
  const expectedSubTopics = tpl.sections.reduce(
    (n, s) => n + (s.topics || []).reduce((m, t) => m + (t.subtopics || []).length, 0),
    0
  );
  let existing = await Roadmap.findOne({ subject: tpl.subject, title: tpl.title, isTemplate: true, linked: { $ne: true } });

  let roadmap = existing;

  if (existing) {
    const sectionCount = await Section.countDocuments({ roadmapId: existing._id, optional: false, createdBy: null });
    const topicCount = await Topic.countDocuments({ roadmapId: existing._id, createdBy: null });
    const subTopicCount = await SubTopic.countDocuments({ roadmapId: existing._id, createdBy: null });
    const matches = sectionCount === expectedSections && topicCount === expectedTopics && subTopicCount === expectedSubTopics;
    if (matches) {
      console.log(`  Template "${tpl.title}" already seeded, skipping`);
      return existing;
    }
    console.log(
      `  Template "${tpl.title}" found with old/different content (${sectionCount} sections / ${topicCount} topics / ${subTopicCount} subtopics), restoring...`
    );
    await SubTopic.deleteMany({ roadmapId: existing._id, createdBy: null });
    await Section.deleteMany({ roadmapId: existing._id, createdBy: null });
    await Topic.deleteMany({ roadmapId: existing._id, createdBy: null });
  } else {
    roadmap = await Roadmap.create({
      title: tpl.title,
      icon: tpl.icon || 'Map',
      subject: tpl.subject,
      description: tpl.description || '',
      isTemplate: true,
      ownerId: null,
    });
  }

  let sectionCount = 0;
  let topicCount = 0;
  let subTopicCount = 0;

  for (let si = 0; si < tpl.sections.length; si += 1) {
    const sec = tpl.sections[si];
    const section = await Section.create({
      roadmapId: roadmap._id,
      title: sec.title,
      description: sec.description || '',
      optional: sec.optional || false,
      createdBy: null,
      order: si,
    });
    sectionCount += 1;

    const topics = sec.topics || [];
    for (let ti = 0; ti < topics.length; ti += 1) {
      const topic = topics[ti];
      const created = await Topic.create({
        sectionId: section._id,
        roadmapId: roadmap._id,
        title: topic.title,
        description: topic.description || '',
        optional: sec.optional || false,
        order: ti,
        isCustom: false,
        createdBy: null,
      });
      topicCount += 1;

      const subtopics = topic.subtopics || [];
      for (let spi = 0; spi < subtopics.length; spi += 1) {
        const sub = subtopics[spi];
        await SubTopic.create({
          topicId: created._id,
          roadmapId: roadmap._id,
          title: sub.title,
          description: sub.description || '',
          difficulty: sub.difficulty || 'medium',
          estimatedTime: sub.estimatedTime || '',
          order: spi,
          isCustom: false,
          createdBy: null,
        });
        subTopicCount += 1;
      }
    }
  }

  console.log(
    `  Template "${tpl.title}" seeded (${sectionCount} sections, ${topicCount} topics, ${subTopicCount} subtopics)`
  );
  return roadmap;
};

const seed = async () => {
  try {
    await connectDB();

    console.log('Seeding MERN template...');
    await createTemplate(buildMernTemplate());

    console.log('Seeding DSA template...');
    await createTemplate(buildDsaTemplate());

    console.log('Seeding PCM template...');
    await createTemplate(buildPcmTemplate());

    console.log('Seeding PCB (NEET) template...');
    await createTemplate(buildPcbTemplate());

    console.log('Seeding Python Backend Development template...');
    await createTemplate(buildPythonBackendTemplate());

    console.log('Seeding Machine Learning template...');
    await createTemplate(buildMachineLearningTemplate());

    console.log('Seeding GATE CS 2027 template...');
    await createTemplate(buildGateTemplate());

    const counts = await Promise.all([
      Roadmap.countDocuments(),
      Section.countDocuments(),
      Topic.countDocuments(),
      SubTopic.countDocuments(),
    ]);
    console.log('Seeding complete:');
    console.log(`  Roadmaps: ${counts[0]}`);
    console.log(`  Sections: ${counts[1]}`);
    console.log(`  Topics:   ${counts[2]}`);
    console.log(`  SubTopics: ${counts[3]}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();