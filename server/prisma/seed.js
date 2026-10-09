const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { allLessons } = require('./curriculum');
const placementQuestions = require('./curriculum/placementQuestions');

const prisma = new PrismaClient();

async function main() {
  console.log(`--- Seeding Comprehensive 6-Level CEFR Curriculum: ${allLessons.length} Lessons ---`);

  // Clean existing tables to avoid duplicate or broken foreign keys
  await prisma.quizAttempt.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.userVocabulary.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.reading.deleteMany();
  await prisma.listening.deleteMany();
  await prisma.grammarPoint.deleteMany();
  await prisma.vocabulary.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.placementQuestion.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Default Users (Admin & Student)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin E4B',
      email: 'admin@e4b.com',
      password: adminPassword,
      role: 'ADMIN',
      level: 'B2',
      goal: 'Manage System',
      xp: 850,
      streakDays: 14,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: 'Duy Phạm',
      email: 'student@e4b.com',
      password: studentPassword,
      role: 'STUDENT',
      level: 'A1',
      goal: 'Zero-foundation',
      xp: 220,
      streakDays: 5,
    },
  });

  console.log('Created Users:', { admin: admin.email, student: student.email });

  let totalVocabCount = 0;
  let totalQuizCount = 0;
  const createdVocabIds = [];

  // 2. Seed All 180 Lessons across 6 CEFR Levels (A1 to C2)
  for (const lData of allLessons) {
    const { vocabularies, grammarPoints, listenings, readings, conversations, exercises, quizzes, ...lessonInfo } = lData;

    const createdLesson = await prisma.lesson.create({
      data: lessonInfo,
    });

    if (vocabularies && vocabularies.length > 0) {
      for (const v of vocabularies) {
        const createdV = await prisma.vocabulary.create({
          data: {
            ...v,
            lessonId: createdLesson.id,
            level: createdLesson.level,
          },
        });
        totalVocabCount++;
        createdVocabIds.push(createdV.id);
      }
    }

    if (grammarPoints && grammarPoints.length > 0) {
      for (const g of grammarPoints) {
        await prisma.grammarPoint.create({
          data: {
            ...g,
            lessonId: createdLesson.id,
          },
        });
      }
    }

    if (listenings && listenings.length > 0) {
      for (const l of listenings) {
        await prisma.listening.create({
          data: {
            ...l,
            lessonId: createdLesson.id,
          },
        });
      }
    }

    if (readings && readings.length > 0) {
      for (const r of readings) {
        await prisma.reading.create({
          data: {
            ...r,
            lessonId: createdLesson.id,
          },
        });
      }
    }

    if (conversations && conversations.length > 0) {
      for (const c of conversations) {
        await prisma.conversation.create({
          data: {
            ...c,
            lessonId: createdLesson.id,
          },
        });
      }
    }

    if (exercises && exercises.length > 0) {
      for (const e of exercises) {
        await prisma.exercise.create({
          data: {
            ...e,
            lessonId: createdLesson.id,
          },
        });
      }
    }

    if (quizzes && quizzes.length > 0) {
      for (const q of quizzes) {
        await prisma.quizQuestion.create({
          data: {
            ...q,
            lessonId: createdLesson.id,
          },
        });
        totalQuizCount++;
      }
    }
  }

  console.log(`Seeded ${allLessons.length} Lessons with ${totalVocabCount} Vocabularies and ${totalQuizCount} Quizzes.`);

  // 3. Seed Placement Test Questions
  for (const q of placementQuestions) {
    await prisma.placementQuestion.create({
      data: q,
    });
  }
  console.log(`Seeded ${placementQuestions.length} Placement Questions.`);

  // 4. Seed Initial Student Progress (Lesson 1 of A1 Completed)
  const a1Lesson1 = await prisma.lesson.findFirst({
    where: { level: 'A1', orderNumber: 1 },
  });
  if (a1Lesson1) {
    await prisma.userProgress.create({
      data: {
        userId: student.id,
        lessonId: a1Lesson1.id,
        progress: 100,
        completed: true,
        score: 100,
        completedAt: new Date(),
      },
    });
  }

  // 5. Seed Sample User Saved Vocabularies for Student
  if (createdVocabIds.length >= 30) {
    for (let i = 0; i < 30; i++) {
      const vId = createdVocabIds[i];
      await prisma.userVocabulary.create({
        data: {
          userId: student.id,
          vocabularyId: vId,
          status: i < 10 ? 'MASTERED' : (i < 20 ? 'NEED_REVIEW' : 'LEARNING'),
          isFavorite: i % 2 === 0,
        },
      });
    }
  }

  console.log(`--- Seeding Complete: ${allLessons.length} Lessons, ${totalVocabCount} Vocabularies, ${totalQuizCount} Quiz Questions, ${placementQuestions.length} Placement Questions Loaded! ---`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
