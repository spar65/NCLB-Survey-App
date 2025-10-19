/**
 * Script to create test survey responses for development
 * @rule 060 "Database operations following API standards"
 * @rule 105 "TypeScript strict typing"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestResponses() {
  console.log('🧪 Creating test survey responses...');

  // Get survey versions
  const versions = await prisma.surveyVersion.findMany();
  
  if (versions.length === 0) {
    console.log('❌ No survey versions found. Run seed script first.');
    return;
  }

  // Sample responses for different groups
  const sampleResponses = {
    Teachers: [
      {
        q1_tech_use: 'I currently use tablets, interactive whiteboards, and educational apps in my classroom. I see AI as a powerful tool for creating personalized learning experiences and automating administrative tasks.',
        q2_benefits_challenges: 'Benefits include personalized learning paths and instant feedback. Challenges include ensuring academic integrity and managing the learning curve for both teachers and students.',
        q3_training_needs: 'Hands-on workshops',
      },
      {
        q1_tech_use: 'We use Chromebooks and Google Classroom extensively. AI could help with differentiated instruction and real-time assessment of student understanding.',
        q2_benefits_challenges: 'AI could save time on grading and provide insights into student learning patterns. However, I worry about over-reliance on technology and potential bias in AI systems.',
        q3_training_needs: 'Online courses',
      }
    ],
    Students: [
      {
        q1_ai_use: 'I use ChatGPT about 2-3 times per week for help with essay brainstorming and explaining complex concepts. I also use it for coding assignments.',
        q2_cheating_perception: 'Helpful when used appropriately',
      },
      {
        q1_ai_use: 'I use AI tools daily for homework help, especially for math problems and writing assistance. It helps me understand concepts better.',
        q2_cheating_perception: 'Always helpful',
      }
    ]
  };

  let responseCount = 0;

  // Create responses for Teachers
  const teacherVersion = versions.find(v => v.group === 'Teachers');
  if (teacherVersion) {
    for (const responseData of sampleResponses.Teachers) {
      await prisma.surveyResponse.create({
        data: {
          email: `teacher${responseCount + 1}@example.com`,
          group: 'Teachers',
          versionId: teacherVersion.id,
          responses: responseData,
          completionTime: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
          partial: false,
          deviceType: Math.random() > 0.5 ? 'desktop' : 'mobile',
        },
      });
      responseCount++;
    }
  }

  // Create responses for Students
  const studentVersion = versions.find(v => v.group === 'Students');
  if (studentVersion) {
    for (const responseData of sampleResponses.Students) {
      await prisma.surveyResponse.create({
        data: {
          email: `student${responseCount + 1}@example.com`,
          group: 'Students',
          versionId: studentVersion.id,
          responses: responseData,
          completionTime: Math.floor(Math.random() * 400) + 200, // 3-10 minutes
          partial: false,
          deviceType: 'mobile', // Students more likely to use mobile
        },
      });
      responseCount++;
    }
  }

  // Create a partial response
  if (teacherVersion) {
    await prisma.surveyResponse.create({
      data: {
        email: 'partial@example.com',
        group: 'Teachers',
        versionId: teacherVersion.id,
        responses: {
          q1_tech_use: 'I use basic technology like projectors and...' // Incomplete
        },
        completionTime: 120, // 2 minutes (partial)
        partial: true,
        deviceType: 'desktop',
      },
    });
    responseCount++;
  }

  console.log(`✅ Created ${responseCount} test survey responses`);
}

createTestResponses()
  .catch((e) => {
    console.error('❌ Failed to create test responses:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
