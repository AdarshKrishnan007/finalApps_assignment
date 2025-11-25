import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";

import Papa from "papaparse";

export async function POST(req) {
  await connectDB();
  const text = await req.text();

  const result = Papa.parse(text, { header: true });

  await Product.insertMany(result.data);

  return new Response("Imported Successfully", { status: 200 });
}
