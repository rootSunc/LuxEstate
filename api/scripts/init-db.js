import dotenv from "dotenv";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";

dotenv.config();

const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD || "ChangeMe123!";
const SHOULD_RESET = process.argv.includes("--reset");

const SEED_USERS = [
  {
    email: "owner1@luxestate.local",
    username: "owner_one",
    avatar:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=400&q=80",
  },
  {
    email: "owner2@luxestate.local",
    username: "owner_two",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
  },
  {
    email: "demo@luxestate.local",
    username: "demo_user",
    avatar:
      "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=400&q=80",
  },
];

const SEED_LISTINGS = [
  {
    name: "Harbor View Apartment",
    description:
      "A bright two-bedroom apartment with large windows, modern finishes, and a short walk to downtown transit.",
    address: "120 Harbor Street, San Diego, CA",
    regularPrice: 3200,
    discountPrice: 2950,
    bathrooms: 2,
    bedrooms: 2,
    furnished: true,
    parking: true,
    type: "rent",
    offer: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    ownerEmail: "owner1@luxestate.local",
  },
  {
    name: "Downtown Studio Loft",
    description:
      "Open-plan studio loft with high ceilings, industrial accents, and secure building access in the city core.",
    address: "88 Market Avenue, Seattle, WA",
    regularPrice: 2100,
    discountPrice: 2100,
    bathrooms: 1,
    bedrooms: 1,
    furnished: false,
    parking: false,
    type: "rent",
    offer: false,
    imageUrls: [
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    ],
    ownerEmail: "owner1@luxestate.local",
  },
  {
    name: "Suburban Family Home",
    description:
      "Spacious home with private backyard, updated kitchen, and attached garage in a quiet residential neighborhood.",
    address: "42 Cedar Lane, Austin, TX",
    regularPrice: 585000,
    discountPrice: 560000,
    bathrooms: 3,
    bedrooms: 4,
    furnished: false,
    parking: true,
    type: "sale",
    offer: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    ],
    ownerEmail: "owner2@luxestate.local",
  },
  {
    name: "Modern Hillside Villa",
    description:
      "Contemporary villa featuring panoramic views, premium materials, and a private outdoor lounge area.",
    address: "9 Ridge Drive, Los Angeles, CA",
    regularPrice: 1850000,
    discountPrice: 1790000,
    bathrooms: 4,
    bedrooms: 5,
    furnished: true,
    parking: true,
    type: "sale",
    offer: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    ],
    ownerEmail: "owner2@luxestate.local",
  },
  {
    name: "Cozy Garden Cottage",
    description:
      "Charming one-bedroom cottage with natural light, private patio, and easy access to local cafes and parks.",
    address: "17 Maple Court, Portland, OR",
    regularPrice: 2450,
    discountPrice: 2300,
    bathrooms: 1,
    bedrooms: 1,
    furnished: true,
    parking: false,
    type: "rent",
    offer: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    ownerEmail: "demo@luxestate.local",
  },
];

const ensureMongoConfig = () => {
  if (!process.env.MONGO) {
    throw new Error("MONGO must be configured before running the seed script");
  }
  if (SEED_USER_PASSWORD.length < 8) {
    throw new Error("SEED_USER_PASSWORD must be at least 8 characters");
  }
};

const connectDatabase = async () => {
  await mongoose.connect(process.env.MONGO);
};

const resetSeedData = async () => {
  const seedEmails = SEED_USERS.map((user) => user.email);
  const existingUsers = await User.find({ email: { $in: seedEmails } }, { _id: 1 });
  const seedUserIds = existingUsers.map((user) => user._id);

  if (seedUserIds.length > 0) {
    await Listing.deleteMany({ userRef: { $in: seedUserIds } });
  }

  await User.deleteMany({ email: { $in: seedEmails } });
};

const upsertUsers = async () => {
  const hashedPassword = await bcryptjs.hash(SEED_USER_PASSWORD, 10);
  const usersByEmail = new Map();

  for (const seedUser of SEED_USERS) {
    const user = await User.findOneAndUpdate(
      { email: seedUser.email },
      {
        $set: {
          username: seedUser.username,
          avatar: seedUser.avatar,
        },
        $setOnInsert: {
          email: seedUser.email,
          password: hashedPassword,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    usersByEmail.set(seedUser.email, user);
  }

  return usersByEmail;
};

const upsertListings = async (usersByEmail) => {
  for (const seedListing of SEED_LISTINGS) {
    const owner = usersByEmail.get(seedListing.ownerEmail);
    if (!owner) {
      throw new Error(`Owner user not found for listing: ${seedListing.name}`);
    }

    const { ownerEmail, ...listingData } = seedListing;

    await Listing.findOneAndUpdate(
      { name: listingData.name, userRef: owner._id },
      {
        $set: {
          ...listingData,
          userRef: owner._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  }
};

const run = async () => {
  ensureMongoConfig();
  await connectDatabase();

  if (SHOULD_RESET) {
    await resetSeedData();
  }

  const usersByEmail = await upsertUsers();
  await upsertListings(usersByEmail);

  console.log("Database initialization completed successfully.");
  console.log(`Seed users: ${SEED_USERS.length}`);
  console.log(`Seed listings: ${SEED_LISTINGS.length}`);
  console.log(`Mode: ${SHOULD_RESET ? "reset + seed" : "upsert seed"}`);
};

run()
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
