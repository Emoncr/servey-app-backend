import { connectDB, disconnectDB } from "../config/db";
import { demoSurvey } from "../config/demoSurvey";
import { env } from "../config/env";
import SurveyResponse from "../models/Response.model";
import Survey from "../models/Survey.model";
import User from "../models/User.model";
import { buildResponseSummary } from "../utils/responseSummary";

const firstNames = [
  "Ayesha",
  "Rafiul",
  "Nusrat",
  "Tanvir",
  "Sadia",
  "Mehedi",
  "Farhana",
  "Arif",
  "Jannatul",
  "Sabbir",
  "Tasnim",
  "Rakib",
  "Sumaiya",
  "Naim",
  "Ishrat",
  "Fahim",
  "Mim",
  "Shakib",
  "Anika",
  "Rasel",
];

const lastNames = [
  "Hossain",
  "Akhter",
  "Islam",
  "Chowdhury",
  "Rahman",
  "Sultana",
  "Karim",
  "Hasan",
  "Khan",
  "Ahmed",
];

const universities = [
  "University of Dhaka",
  "BUET",
  "North South University",
  "BRAC University",
  "Rajshahi University",
  "Chittagong University",
  "Jahangirnagar University",
  "Daffodil International University",
];

const departments = [
  "Computer Science and Engineering",
  "Software Engineering",
  "Electrical and Electronic Engineering",
  "Business Administration",
  "Economics",
  "Civil Engineering",
  "Mathematics",
  "Pharmacy",
];

const addresses = [
  "Dhanmondi, Dhaka",
  "Mirpur, Dhaka",
  "Uttara, Dhaka",
  "Agrabad, Chattogram",
  "Boalia, Rajshahi",
  "Sonadanga, Khulna",
  "Zindabazar, Sylhet",
  "Sadar, Cumilla",
];

const genders = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
];

const educationLevels = [
  "SSC / Secondary",
  "HSC / Higher Secondary",
  "Diploma",
  "Bachelor's",
  "Master's",
  "PhD",
  "Other",
];

const educationStatuses = [
  "Currently Enrolled",
  "Graduated",
  "On Leave / Gap Year",
  "Pursuing Postgraduate Research",
];

const occupations = [
  "Student",
  "Employed",
  "Self-employed",
  "Freelancer",
  "Unemployed",
  "Other",
];

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const buildSampleResponses = () => {
  const now = Date.now();

  return Array.from({ length: 20 }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const fullName = `${firstName} ${pick(lastNames)}`;
    const age = 18 + Math.floor(Math.random() * 16);
    const occupation = index % 4 === 0 ? undefined : pick(occupations);
    const comments =
      index % 5 === 0
        ? "Happy to help with follow-up research if needed."
        : undefined;

    const answers = {
      fullName,
      age,
      gender: pick(genders),
      address: pick(addresses),
      educationLevel: pick(educationLevels),
      university: pick(universities),
      department: pick(departments),
      currentStatus: pick(educationStatuses),
      email: `${firstName.toLowerCase()}.${index + 1}@example.com`,
      contactNumber: `017${String(10000000 + index * 7919).slice(0, 8)}`,
      ...(occupation ? { occupation } : {}),
      ...(comments ? { comments } : {}),
    };

    const createdAt = new Date(
      now - Math.floor(Math.random() * 13.5 * 24 * 60 * 60 * 1000)
    );

    return {
      ...buildResponseSummary(demoSurvey.slug, answers),
      createdAt,
      updatedAt: createdAt,
    };
  });
};

const seed = async (): Promise<void> => {
  await connectDB();

  const reset = process.argv.includes("--reset");

  const existingAdmin = await User.findOne({ email: env.SEED_ADMIN_EMAIL });
  if (existingAdmin) {
    console.log(`Admin already exists: ${env.SEED_ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Created admin: ${env.SEED_ADMIN_EMAIL}`);
  }

  const survey = await Survey.findOneAndUpdate(
    { slug: demoSurvey.slug },
    demoSurvey,
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
  console.log(`Survey ready: ${survey.slug}`);

  if (reset) {
    const deleted = await SurveyResponse.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing responses`);
  }

  const currentCount = await SurveyResponse.countDocuments();
  if (currentCount > 0) {
    console.log(
      `Skipped sample data: ${currentCount} responses already exist (run with --reset to replace)`
    );
  } else {
    const samples = buildSampleResponses();
    await SurveyResponse.collection.insertMany(samples);
    console.log(`Inserted ${samples.length} sample survey responses`);
  }

  console.log("\nSeed complete. Sign in with:");
  console.log(`  Email:    ${env.SEED_ADMIN_EMAIL}`);
  console.log(`  Password: ${env.SEED_ADMIN_PASSWORD}`);
  console.log(`\nPublic survey: /s/${demoSurvey.slug}`);

  await disconnectDB();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});
