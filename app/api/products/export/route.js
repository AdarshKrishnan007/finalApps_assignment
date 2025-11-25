// app/api/products/export/route.js
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";

export async function GET(req) {
  try {
    await connectDB();

    // Fetch fake store products safely
    let fakeStoreProducts = [];
    try {
      const res = await fetch("https://fakestoreapi.com/products");
      if (res.ok) {
        fakeStoreProducts = await res.json();
      } else {
        console.warn("Fake store API responded with status:", res.status);
      }
    } catch (err) {
      console.warn("Failed to fetch fake store products:", err.message);
    }

    // Fetch MongoDB products
    const dbProducts = await Product.find();

    // Combine products
    const combinedProducts = [
      ...fakeStoreProducts.map((p) => ({
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image,
        inventory: 0,
        vendor: "FakeStore",
        status: "active",
      })),
      ...dbProducts.map((p) => ({
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image,
        inventory: p.inventory || 0,
        vendor: p.vendor || "",
        status: p.status || "active",
      })),
    ];

    // Convert to CSV
    const csvHeader =
      "title,description,price,category,image,inventory,vendor,status";
    const csvRows = combinedProducts.map(
      (p) =>
        `"${p.title}","${p.description}",${p.price},"${p.category}","${p.image}",${p.inventory},"${p.vendor}","${p.status}"`
    );
    const csv = [csvHeader, ...csvRows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=products.csv",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
