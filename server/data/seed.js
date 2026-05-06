import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../src/models/Admin.js";
import Rescuer from "../src/models/Rescuer.js";
import { normalizeCity } from "../src/utils/cities.js";

dotenv.config();

const rawRescuerData = [
  {
    name: "People for Animals Bengaluru",
    city: "bangalore",
    phone: "+91-80-28611986",
    whatsapp: "+91-9980339880",
    specialties: ["wildlife", "dogs", "cats", "mammals"],
    available24hr: true,
    lat: 12.9716,
    lng: 77.5946,
    address: "Wildlife Rescue and Conservation Centre, Bengaluru, Karnataka",
    verified: true,
  },
  {
    name: "People for Animals Hubballi-Dharwad",
    city: "hubballi",
    phone: "+91-9242239565",
    whatsapp: "+91-9845799969",
    specialties: ["wildlife", "dogs", "stray animals"],
    available24hr: true,
    lat: 15.3647,
    lng: 75.124,
    address:
      "At-pale, old Karuna Gaushala, near Shell petrol pump, NH-4, Pale, Hubballi, Dharwad, Karnataka",
    verified: true,
  },
  {
    name: "Hubli Vidyanagar Wildlife Response (Demo)",
    city: "hubli",
    phone: "+91-9000002101",
    whatsapp: "+91-9000002101",
    specialties: ["birds", "stray dogs", "emergency rescue"],
    available24hr: false,
    lat: 15.3642,
    lng: 75.1239,
    address: "Vidyanagar, Hubli, Karnataka",
    verified: true,
  },
  {
    name: "Dharwad Animal Rescue Network (Demo)",
    city: "dharwad",
    phone: "+91-9000002102",
    whatsapp: "+91-9000002102",
    specialties: ["wildlife", "dogs", "cats"],
    available24hr: true,
    lat: 15.4589,
    lng: 75.0078,
    address: "Saptapur, Dharwad, Karnataka",
    verified: true,
  },
  {
    name: "Navanagar Rescue Volunteer Group (Demo)",
    city: "hubli-dharwad",
    phone: "+91-9000002103",
    whatsapp: "+91-9000002103",
    specialties: ["snakes", "reptiles", "wildlife"],
    available24hr: true,
    lat: 15.3928,
    lng: 75.0834,
    address: "Navanagar, Hubli-Dharwad, Karnataka",
    verified: true,
  },
  {
    name: "People for Animals Mysore",
    city: "mysore",
    phone: "+91-9845654429",
    whatsapp: "+91-9845654429",
    specialties: ["stray dogs", "cats", "wildlife"],
    available24hr: true,
    lat: 12.2958,
    lng: 76.6394,
    address: "PFA Mysore, Mysuru, Karnataka",
    verified: true,
  },
  {
    name: "Vijayanagar Mysore Animal Help (Demo)",
    city: "mysore",
    phone: "+91-9000002201",
    whatsapp: "+91-9000002201",
    specialties: ["stray dogs", "cats", "birds"],
    available24hr: false,
    lat: 12.3182,
    lng: 76.6177,
    address: "Vijayanagar, Mysore, Karnataka",
    verified: true,
  },
  {
    name: "Mangalore Coastal Animal Rescue (Demo)",
    city: "mangalore",
    phone: "+91-9000002301",
    whatsapp: "+91-9000002301",
    specialties: ["wildlife", "birds", "stray animals"],
    available24hr: true,
    lat: 12.9141,
    lng: 74.856,
    address: "Kadri, Mangalore, Karnataka",
    verified: true,
  },
  {
    name: "Udupi-Mangalore Bird Rescue Desk (Demo)",
    city: "mangalore",
    phone: "+91-9000002302",
    whatsapp: "+91-9000002302",
    specialties: ["birds", "wildlife rehabilitation"],
    available24hr: false,
    lat: 12.8697,
    lng: 74.8424,
    address: "Pandeshwar, Mangalore, Karnataka",
    verified: true,
  },
  {
    name: "Belgaum Wildlife Response Desk (Demo)",
    city: "belgaum",
    phone: "+91-9000002401",
    whatsapp: "+91-9000002401",
    specialties: ["snakes", "wildlife", "large animals"],
    available24hr: true,
    lat: 15.8497,
    lng: 74.4977,
    address: "Tilakwadi, Belgaum, Karnataka",
    verified: true,
  },
  {
    name: "Belagavi Stray Animal Support (Demo)",
    city: "belagavi",
    phone: "+91-9000002402",
    whatsapp: "+91-9000002402",
    specialties: ["dogs", "cats", "veterinary care"],
    available24hr: false,
    lat: 15.8631,
    lng: 74.502,
    address: "Shahapur, Belagavi, Karnataka",
    verified: true,
  },
  {
    name: "Wildlife Ark Rehabilitation and Rescue Centre (WARRC)",
    city: "bangalore",
    phone: "+91-9449642222",
    whatsapp: "+91-9449642222",
    specialties: ["wildlife rehabilitation", "birds", "reptiles"],
    available24hr: true,
    lat: 13.0264,
    lng: 77.6122,
    address:
      "No 8, 4th Main Road, Horamavu Main Road, Bengaluru, Karnataka 560043",
    verified: true,
  },
  {
    name: "Karuna Animal Welfare Association of Karnataka",
    city: "bangalore",
    phone: "+91-80-23411181",
    whatsapp: null,
    specialties: ["stray dogs", "shelter", "veterinary care"],
    available24hr: false,
    lat: 13.0111,
    lng: 77.5866,
    address:
      "Kasturba Road, Opposite Queens Statue, Bengaluru, Karnataka 560001",
    verified: true,
  },
  {
    name: "Karuna Animal Shelter",
    city: "bangalore",
    phone: "+91-80-23411181",
    whatsapp: null,
    specialties: ["stray dogs", "shelter", "veterinary care"],
    available24hr: false,
    lat: 13.0296,
    lng: 77.5946,
    address: "Veterinary College Campus, Hebbal, Bengaluru, Karnataka 560024",
    verified: true,
  },
  {
    name: "Dolma Dog Rescue",
    city: "bylakuppe",
    phone: "+91-9449642222",
    whatsapp: null,
    specialties: ["dogs", "stray dogs"],
    available24hr: false,
    lat: 12.45,
    lng: 76.15,
    address: "Old Camp No 1, Bylakuppe, Karnataka",
    verified: true,
  },
  {
    name: "Simba's Home",
    city: "madikeri",
    phone: "+91-8762922975",
    whatsapp: "+91-8762922975",
    specialties: ["dogs", "strays"],
    available24hr: false,
    lat: 12.5133,
    lng: 75.7522,
    address: "Madikeri, Karnataka",
    verified: true,
  },
  {
    name: "BBMP Animal & Wildlife Helpline",
    city: "bangalore",
    phone: "1533",
    whatsapp: null,
    specialties: ["urban wildlife", "stray animals", "emergency response"],
    available24hr: true,
    lat: 12.9716,
    lng: 77.5946,
    address: "BBMP Helpline, Bengaluru, Karnataka",
    verified: true,
  },
  {
    name: "Mahendra Singh (Large Animal Rescues)",
    city: "bengaluru",
    phone: "+91-9886869017",
    whatsapp: "+91-9886869017",
    specialties: ["large animals", "cattle", "horses"],
    available24hr: true,
    lat: 12.9716,
    lng: 77.5946,
    address: "Bengaluru, Karnataka (exact locality not publicly listed)",
    verified: false,
  },
  {
    name: "Wildlife Rescue Bengaluru (example placeholder)",
    city: "bangalore",
    phone: "+91-9036111007",
    whatsapp: "+91-9036111007",
    specialties: ["reptiles", "mammals"],
    available24hr: true,
    lat: 13.1026,
    lng: 77.5616,
    address: "Vidyaranyapura, Bengaluru",
    verified: false,
  },
];

function normalizeSpecialties(specialties = []) {
  const normalized = new Set();

  for (const specialty of specialties) {
    const value = specialty.toLowerCase();

    if (value.includes("wildlife")) {
      normalized.add("mammals");
      normalized.add("birds");
      normalized.add("reptiles");
    }
    if (value.includes("bird")) normalized.add("birds");
    if (value.includes("reptile") || value.includes("snake")) {
      normalized.add("reptiles");
    }
    if (
      value.includes("mammal") ||
      value.includes("livestock") ||
      value.includes("cattle") ||
      value.includes("horse") ||
      value.includes("large animal")
    ) {
      normalized.add("mammals");
    }
    if (
      value.includes("dog") ||
      value.includes("cat") ||
      value.includes("stray") ||
      value.includes("shelter")
    ) {
      normalized.add("dog-cat");
    }
    if (
      value.includes("veterinary") ||
      value.includes("emergency") ||
      value === "other"
    ) {
      normalized.add("other");
    }
  }

  return normalized.size > 0 ? [...normalized] : ["other"];
}

const rescuerData = rawRescuerData.map((rescuer) => ({
  ...rescuer,
  city: normalizeCity(rescuer.city),
  whatsapp: rescuer.whatsapp || undefined,
  specialties: normalizeSpecialties(rescuer.specialties),
  status: rescuer.verified ? "approved" : "pending",
  addedBy: "admin",
  disabled: false,
  verifiedAt: rescuer.verified ? new Date() : undefined,
  submittedAt: new Date(),
}));

async function seedDatabase() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/rescuelink";
    await mongoose.connect(mongoUri);

    // Clear existing data
    await Rescuer.deleteMany({});
    await Admin.deleteMany({});

    // Seed rescuers
    const result = await Rescuer.insertMany(rescuerData);
    process.stdout.write(`Seeded ${result.length} rescuers\n`);

    // Create admin account
    const adminAccount = await Admin.create({
      email: "admin@rescuelink.com",
      password: "SecurePassword123",
      name: "Admin User",
      isActive: true,
      role: "super_admin",
    });
    process.stdout.write(`Created admin account: ${adminAccount.email}\n`);

    await mongoose.disconnect();
  } catch (error) {
    process.stderr.write(`Seeding failed: ${error.message}\n`);
    process.exit(1);
  }
}

seedDatabase();
