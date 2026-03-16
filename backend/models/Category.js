import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  color: String
});

export default mongoose.model("Category", categorySchema);
