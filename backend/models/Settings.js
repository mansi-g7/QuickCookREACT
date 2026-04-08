import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Home Page Content
  homePageTitle: {
    type: String,
    default: "Welcome to QuickCook"
  },
  homePageSubtitle: {
    type: String,
    default: "Discover delicious recipes for every occasion"
  },
  homePageDescription: {
    type: String,
    default: "Find quick and easy recipes that will satisfy your taste buds and save you time in the kitchen."
  },
  homePageCTA: {
    type: String,
    default: "Explore Recipes"
  },

  // About Us Page Content
  aboutPageTitle: {
    type: String,
    default: "About Us"
  },
  aboutPageContent: {
    type: String,
    default: "We are passionate about sharing delicious and easy-to-make recipes with food enthusiasts around the world."
  },
  aboutPageMission: {
    type: String,
    default: "Our mission is to make cooking accessible and enjoyable for everyone, regardless of their skill level."
  },
  aboutPageVision: {
    type: String,
    default: "We envision a world where everyone can confidently prepare delicious meals at home."
  },

  // Contact Us Page Content
  contactPageTitle: {
    type: String,
    default: "Contact Us"
  },
  contactPageDescription: {
    type: String,
    default: "Have a question or feedback? We'd love to hear from you!"
  },
  contactPageEmail: {
    type: String,
    default: "support@quickcook.com"
  },
  contactPagePhone: {
    type: String,
    default: "+1-800-RECIPE-1"
  },
  contactPageAddress: {
    type: String,
    default: "123 Recipe Lane, Cooking City, CC 12345"
  },

  // General Settings
  siteTitle: {
    type: String,
    default: "QuickCook Recipe Finder"
  },
  siteDescription: {
    type: String,
    default: "Providing the best recipes for every kitchen since 2026."
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);
