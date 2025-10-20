/**
 * Database Seed Script
 * @rule 060 "API standards for database operations"
 * @rule 105 "TypeScript strict typing"
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Initialize system settings
  const systemSettings = await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      productionMode: false,
    },
  });

  console.log('✅ System settings initialized:', systemSettings.productionMode ? 'Production' : 'Development', 'mode');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPasswordHash,
      name: 'System Administrator',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create initial survey versions for each group
  const groups = ['Teachers', 'Students', 'Administrators', 'IT_Admins'];
  
  for (const group of groups) {
    const surveyVersion = await prisma.surveyVersion.upsert({
      where: { version: `v1.0-${group}` },
      update: {},
      create: {
        version: `v1.0-${group}`,
        group,
        description: `Initial ${group} survey based on NCLB framework`,
        questions: getSampleQuestions(group),
        isActive: true,
      },
    });

    console.log(`✅ Survey version created for ${group}:`, surveyVersion.version);
  }

  // Create sample invited users for testing
  const testUsers = [
    { email: 'teacher@example.com', group: 'Teachers' },
    { email: 'student@example.com', group: 'Students' },
    { email: 'admin_survey@example.com', group: 'Administrators' }, // Survey participant, NOT site admin
    { email: 'it@example.com', group: 'IT_Admins' },
    { email: 'spehargreg@yahoo.com', group: 'Teachers' }, // Real user for testing
  ];

  for (const user of testUsers) {
    await prisma.invitedUser.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        group: user.group,
        consented: false,
        hasTaken: false,
      },
    });

    console.log(`✅ Test user created: ${user.email} (${user.group})`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

function getSampleQuestions(group: string) {
  const questionSets = {
    Teachers: [
      {
        id: 'q1_tech_use',
        text: 'How do you currently use technology in your classrooms, and what role do you see for AI in enhancing your teaching practices?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe your current technology use and AI vision...',
        validation: { minLength: 50, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q2_benefits_challenges',
        text: 'What benefits do you anticipate from using AI in education, and what challenges or concerns do you have? (e.g., Cheating)',
        type: 'open_ended',
        required: true,
        placeholder: 'Share your thoughts on benefits and challenges...',
        validation: { minLength: 50, maxLength: 1000 },
        branching: { if: "mentions 'cheating'", show: 'q2_followup' }
      },
      {
        id: 'q3_training_needs',
        text: 'What kind of training or support would you need to effectively integrate AI into your teaching?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe training and support needs...',
        validation: { minLength: 30, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q4_diverse_needs',
        text: 'How do you think AI can help address the diverse learning needs of your students?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe how AI can support diverse learners...',
        validation: { minLength: 30, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q5_ethics',
        text: 'What are your thoughts on the ethical use of AI in education, particularly regarding issues like bias and data privacy?',
        type: 'open_ended',
        required: true,
        placeholder: 'Share your thoughts on AI ethics in education...',
        validation: { minLength: 30, maxLength: 1000 },
        branching: {}
      }
    ],
    Students: [
      {
        id: 'q1_ai_use',
        text: 'How often do you use AI tools like ChatGPT for your schoolwork, and for what purposes (e.g., writing essays, solving math problems)?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe your AI tool usage patterns and purposes...',
        validation: { minLength: 30, maxLength: 800 },
        branching: { if: "mentions specific tools", show: 'q1_followup' }
      },
      {
        id: 'q2_cheating_perception',
        text: 'Do you think using AI for schoolwork is helpful or constitutes cheating?',
        type: 'open_ended',
        required: true,
        placeholder: 'Share your perspective on AI and academic integrity...',
        validation: { minLength: 20, maxLength: 800 },
        branching: {}
      },
      {
        id: 'q3_banning_feelings',
        text: 'How do you feel about schools banning AI tools, and what do you think is the best approach for schools regarding AI use?',
        type: 'open_ended',
        required: true,
        placeholder: 'Share your thoughts on school AI policies...',
        validation: { minLength: 30, maxLength: 800 },
        branching: {}
      },
      {
        id: 'q4_guidance_needs',
        text: 'What kind of education or guidance do you think students need to use AI responsibly and effectively?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe what AI education students need...',
        validation: { minLength: 30, maxLength: 800 },
        branching: {}
      },
      {
        id: 'q5_learning_improvement',
        text: 'In what ways do you think AI can improve your learning experience, and are there any concerns you have about its use in education?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe AI benefits and concerns for learning...',
        validation: { minLength: 30, maxLength: 800 },
        branching: {}
      }
    ],
    Administrators: [
      {
        id: 'q1_district_stance',
        text: 'What is the district\'s current stance on AI in education, and are there any policies or guidelines in place?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe current district policies and stance...',
        validation: { minLength: 50, maxLength: 1000 },
        branching: { if: "mentions policies", show: 'q1_followup' }
      },
      {
        id: 'q2_integration_plan',
        text: 'How does the district plan to integrate AI into the curriculum, and what are the potential benefits and challenges?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe integration plans and considerations...',
        validation: { minLength: 50, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q3_equitable_access',
        text: 'How will the district ensure equal access to AI tools for all students, including those from underserved communities?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe equity and access strategies...',
        validation: { minLength: 40, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q4_outcomes_role',
        text: 'What role does the district see for AI in improving student outcomes, and how will this be measured?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe expected outcomes and measurement approaches...',
        validation: { minLength: 40, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q5_privacy_steps',
        text: 'What steps will the district take to address data privacy and security concerns with AI implementation?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe privacy and security measures...',
        validation: { minLength: 40, maxLength: 1000 },
        branching: {}
      }
    ],
    IT_Admins: [
      {
        id: 'q1_infrastructure_state',
        text: 'What is the current state of your school district\'s technological infrastructure, and is it ready to support AI tools?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe current infrastructure and AI readiness...',
        validation: { minLength: 50, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q2_privacy_risks',
        text: 'What are the potential data privacy and security risks associated with implementing AI in education, and how can we mitigate them?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe privacy risks and mitigation strategies...',
        validation: { minLength: 50, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q3_staff_skills',
        text: 'Do we have the necessary IT staff and skills to manage and maintain AI tools?',
        type: 'open_ended',
        required: true,
        placeholder: 'Assess current IT capabilities and needs...',
        validation: { minLength: 30, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q4_accessibility',
        text: 'How will we ensure that AI tools are accessible and usable for all students, including those with disabilities?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe accessibility considerations and approaches...',
        validation: { minLength: 40, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q5_costs_budget',
        text: 'What are the costs associated with implementing and maintaining AI tools, and how will we budget for them?',
        type: 'open_ended',
        required: true,
        placeholder: 'Describe cost considerations and budget planning...',
        validation: { minLength: 30, maxLength: 1000 },
        branching: {}
      },
      {
        id: 'q6_integration_opinion',
        text: 'In your opinion, how can we integrate AI tools with our existing educational technology systems?',
        type: 'open_ended',
        required: true,
        placeholder: 'Share your thoughts on system integration approaches...',
        validation: { minLength: 40, maxLength: 1000 },
        branching: {}
      }
    ]
  };

  return questionSets[group as keyof typeof questionSets] || [];
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
