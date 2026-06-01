/**
 * Seed Script — creates the initial 7 Summer Camp games.
 * Run once: node utils/seedGames.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Game = require("../models/Game");

const initialGames = [
  {
    name: "Quiz Competition",
    description: "Test your general knowledge, quick thinking, trivia skills, and buzzer reflexes across diverse topics.",
    imageSrc: "/images/FUN.jpg",
    iconName: "Award",
    status: "ongoing",
    order: 1,
  },
  {
    name: "Cultural Activities",
    description: "Engage in traditional dances, musical performances, drama, and artistic expressions celebrating diverse heritages.",
    imageSrc: "/images/cultural.png",
    iconName: "Music",
    status: "ongoing",
    order: 2,
  },
  {
    name: "Volleyball",
    description: "Develop court communication, defensive digging, set accuracy, high-impact spiking, and serves.",
    imageSrc: "/images/volleyball.png",
    iconName: "Volleyball",
    status: "ongoing",
    order: 3,
  },
  {
    name: "Badminton",
    description: "Enhance reflex speeds, court coverage, precision racquet gripping, explosive smashes, and double plays.",
    imageSrc: "/images/badminton.png",
    iconName: "Flame",
    status: "ongoing",
    order: 4,
  },
  {
    name: "Painting",
    description: "Master brush strokes, color mixing, canvas composition, shading techniques, and creative visual expression.",
    imageSrc: "/images/painting.jpg",
    iconName: "Palette",
    status: "ongoing",
    order: 5,
  },
  {
    name: "TUG-OF-WAR",
    description: "Build teamwork, synchronized pulling power, grip strength, stance stability, and collective endurance.",
    imageSrc: "/images/tug.png",
    iconName: "Users",
    status: "ongoing",
    order: 6,
  },
  {
    name: "Fun Activities",
    description: "Enjoy light-hearted games, interactive icebreakers, team-building exercises, and stress-relieving entertainment.",
    imageSrc: "/images/fun-activity.jpg",
    iconName: "Smile",
    status: "ongoing",
    order: 7,
  },
];

const seed = async () => {
  await connectDB();

  console.log("Seeding games into database...");

  for (const gameData of initialGames) {
    const existing = await Game.findOne({ name: gameData.name });
    if (existing) {
      console.log(`ℹ️  Game already exists: ${gameData.name}`);
    } else {
      await Game.create(gameData);
      console.log(`✅ Game created: ${gameData.name}`);
    }
  }

  console.log("🎉 Seeding games finished successfully!");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
