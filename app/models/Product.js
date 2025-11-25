import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  inventory: Number,
  vendor: String,
  status: String,
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
