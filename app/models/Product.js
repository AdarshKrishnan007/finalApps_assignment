import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  inventory: Number,
  vendor: String,
  status: String,
});

// ✅ Important: reuse model if already compiled
export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
