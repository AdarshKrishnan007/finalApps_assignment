"use client";

import React, { useEffect, useState } from "react";
import {
  AppProvider,
  Frame,
  Page,
  Card,
  Button,
  TextField,
  Select,
  IndexTable,
  ButtonGroup,
  Badge,
  Modal,
  Text,
  Tabs,
} from "@shopify/polaris";
import {
  PlusIcon,
  ExportIcon,
  ImportIcon,
  MenuHorizontalIcon,
} from "@shopify/polaris-icons";
import { useRef } from "react";

const IMAGE_URL = "/mnt/data/1d803b97-c131-4765-8460-a99d368beadb.png";

export default function ShopifyAdminDemo() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [typeFilter, setTypeFilter] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const [filters, setFilters] = useState({
    availability: { online: false, pos: false, buy: false },
    type: { men: false, women: false, jewelery: false, electronics: false },
    vendor: { company123: false, boringRock: false, rustic: false },
  });

  const [addOpen, setAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    vendor: "",
    inventory: "",
    image: "",
    status: "Active",
  });
  const fileInputRef = useRef(null);

  // Load products
  useEffect(() => {
    async function load() {
      try {
        // 1. Load FakeStore API products
        const fakeRes = await fetch("https://fakestoreapi.com/products");
        const fakeData = await fakeRes.json();
        const enrichedFake = fakeData.map((p, i) => ({
          ...p,
          status: i % 4 === 0 ? "Active" : "Draft",
          inventory: Math.floor(Math.random() * 2000) - 150,
          vendor: ["Rustic LTD", "Boring Rock", "Company 123", "partnersdemo"][
            i % 4
          ],
          source: "fake", // helps if you want to identify later
        }));

        // 2. Load MongoDB products
        const dbRes = await fetch("/api/products");
        const dbData = await dbRes.json();
        const enrichedDb = dbData.map((p) => ({
          ...p,
          source: "db",
        }));

        // 3. Combine both
        const combined = [...enrichedDb, ...enrichedFake];

        // 4. Show them
        setProducts(combined);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Fetch analytics
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
    }
    fetchAnalytics();
  }, []);

  const sendToGemini = (action, product) => {
    if (window.gemini3) {
      window.gemini3.push({ action, product, timestamp: Date.now() });
      console.log("Sent to Gemini:", { action, product });
    }
  };

  const sendAnalytics = async (action, product, setAnalytics) => {
    try {
      // Send to your own server (optional)
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, product }),
      });

      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);

      sendToGemini(action, product);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  // Tabs
  const tabs = [
    { id: "all", content: "All" },
    { id: "active", content: "Active" },
    { id: "draft", content: "Draft" },
    { id: "archived", content: "Archived" },
  ];

  // Filter products
  const filtered = products.filter((p) => {
    const { availability, type, vendor } = filters;

    if (query && !p.title.toLowerCase().includes(query.toLowerCase()))
      return false;

    if (tabs[activeTab].id === "active" && p.status !== "Active") return false;
    if (tabs[activeTab].id === "draft" && p.status !== "Draft") return false;
    if (tabs[activeTab].id === "archived" && p.inventory > -100) return false;

    if (typeFilter !== "All" && p.category !== typeFilter) return false;

    const anyAvail = Object.values(availability).some(Boolean);
    if (anyAvail) {
      const hasAvail =
        (availability.online && p.availability?.online) ||
        (availability.pos && p.availability?.pos) ||
        (availability.buy && p.availability?.buy);
      if (!hasAvail) return false;
    }

    const anyType = Object.values(type).some(Boolean);
    if (anyType) {
      const matchType =
        (type.men && p.category === "men's clothing") ||
        (type.women && p.category === "women's clothing") ||
        (type.jewelery && p.category === "jewelery") ||
        (type.electronics && p.category === "electronics");
      if (!matchType) return false;
    }

    const anyVendor = Object.values(vendor).some(Boolean);
    if (anyVendor) {
      const matchVendor =
        (vendor.company123 && p.vendor === "Company 123") ||
        (vendor.boringRock && p.vendor === "Boring Rock") ||
        (vendor.rustic && p.vendor === "Rustic LTD");
      if (!matchVendor) return false;
    }

    return true;
  });

  const resourceName = { singular: "product", plural: "products" };
  const headings = [
    { title: "" },
    { title: "Product" },
    { title: "Status" },
    { title: "Inventory" },
    { title: "Type" },
    { title: "Vendor" },
  ];

  const updateFilter = (section, key, value) => {
    setFilters((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const resetFilters = () => {
    setFilters({
      availability: { online: false, pos: false, buy: false },
      type: { tshirt: false, accessory: false, giftcard: false },
      vendor: {
        company123: false,
        boringRock: false,
        rustic: false,
        partnersDemo: false,
      },
    });
  };

  return (
    <AppProvider>
      <Frame>
        <Page
          title="Products"
          primaryAction={{
            content: "Add Product",
            icon: PlusIcon,
            onAction: () => setAddOpen(true),
          }}
          secondaryActions={[
            {
              content: "Export",
              icon: ExportIcon,
              className: "white-button",
              onClick: () => (window.location.href = "/api/products/export"),
            },
            {
              content: "Import",
              icon: ImportIcon,
              className: "white-button",
              onClick: () => fileInputRef.current?.click(),
            },
          ]}
        >
          <Card sectioned>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Tabs tabs={tabs} selected={activeTab} onSelect={setActiveTab} />
              <div style={{ display: "flex", gap: 8 }}>
                <TextField
                  value={query}
                  onChange={(v) => setQuery(v)}
                  placeholder="Filter items"
                  clearButton
                  onClearButtonClick={() => setQuery("")}
                />
                <Select
                  label=""
                  options={[
                    ...new Set(["All", ...products.map((p) => p.category)]),
                  ]}
                  onChange={(v) => setTypeFilter(v)}
                  value={typeFilter}
                />
                <Button onClick={() => setFiltersOpen(true)}>
                  More filters
                </Button>
              </div>
            </div>

            <div style={{ overflow: "hidden" }}>
              <IndexTable
                resourceName={resourceName}
                itemCount={filtered.length}
                selectable={false}
                headings={headings}
              >
                {filtered.map((item, index) => (
                  <IndexTable.Row
                    id={item.id}
                    key={item.id}
                    position={index}
                    onClick={() => {
                      setSelectedProduct(item);
                      sendAnalytics("open", item, setAnalytics);
                    }}
                  >
                    <IndexTable.Cell>
                      <img
                        src={item.image || IMAGE_URL}
                        alt="img"
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "contain",
                          borderRadius: 6,
                        }}
                      />
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text variant="bodyMd" as="span">
                        {item.title.length > 40
                          ? item.title.slice(0, 40) + "..."
                          : item.title}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge
                        status={item.status === "Active" ? "success" : "info"}
                      >
                        {item.status}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      {item.inventory < 0 ? (
                        <Text color="critical">{item.inventory}</Text>
                      ) : (
                        <Text>{item.inventory}</Text>
                      )}
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text>{item.category}</Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text>{item.vendor}</Text>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            </div>

            {/* ---- HIDDEN FILE INPUT MUST BE ADDED HERE ---- */}
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files[0];
                const text = await file.text();

                await fetch("/api/products/import", {
                  method: "POST",
                  body: text,
                });

                // Reload products
                const res = await fetch("/api/products");
                setProducts(await res.json());
              }}
            />
          </Card>

          <Modal
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            title="More filters"
            large
          >
            {" "}
            <Modal.Section>
              {" "}
              <div style={{ marginBottom: 20 }}>
                {" "}
                <Text variant="headingMd" as="h3">
                  {" "}
                  Product Type{" "}
                </Text>{" "}
                <div style={{ marginTop: 10 }}>
                  {" "}
                  <label>
                    {" "}
                    <input
                      type="checkbox"
                      checked={filters.type.men}
                      onChange={(e) =>
                        updateFilter("type", "men", e.target.checked)
                      }
                    />{" "}
                    Men's Clothing{" "}
                  </label>{" "}
                  <br />{" "}
                  <label>
                    {" "}
                    <input
                      type="checkbox"
                      checked={filters.type.women}
                      onChange={(e) =>
                        updateFilter("type", "women", e.target.checked)
                      }
                    />{" "}
                    Women's Clothing{" "}
                  </label>{" "}
                  <br />{" "}
                  <label>
                    {" "}
                    <input
                      type="checkbox"
                      checked={filters.type.jewelery}
                      onChange={(e) =>
                        updateFilter("type", "jewelery", e.target.checked)
                      }
                    />{" "}
                    Jewelery{" "}
                  </label>{" "}
                  <br />{" "}
                </div>{" "}
              </div>{" "}
              {/* Vendor */}{" "}
              <div style={{ marginBottom: 20 }}>
                {" "}
                <Text variant="headingMd" as="h3">
                  {" "}
                  Vendor{" "}
                </Text>{" "}
                <div style={{ marginTop: 10 }}>
                  {" "}
                  <label>
                    {" "}
                    <input
                      type="checkbox"
                      checked={filters.vendor.company123}
                      onChange={(e) =>
                        updateFilter("vendor", "company123", e.target.checked)
                      }
                    />{" "}
                    Company 123{" "}
                  </label>{" "}
                  <br />{" "}
                  <label>
                    {" "}
                    <input
                      type="checkbox"
                      checked={filters.vendor.boringRock}
                      onChange={(e) =>
                        updateFilter("vendor", "boringRock", e.target.checked)
                      }
                    />{" "}
                    Boring Rock{" "}
                  </label>{" "}
                  <br />{" "}
                  <label>
                    {" "}
                    <input
                      type="checkbox"
                      checked={filters.vendor.rustic}
                      onChange={(e) =>
                        updateFilter("vendor", "rustic", e.target.checked)
                      }
                    />{" "}
                    Rustic LTD{" "}
                  </label>{" "}
                  <br />{" "}
                </div>{" "}
              </div>{" "}
            </Modal.Section>{" "}
            <Modal.Section>
              {" "}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {" "}
                <Button destructive onClick={resetFilters}>
                  {" "}
                  Clear all filters{" "}
                </Button>{" "}
                <Button primary onClick={() => setFiltersOpen(false)}>
                  {" "}
                  Done{" "}
                </Button>{" "}
              </div>{" "}
            </Modal.Section>{" "}
          </Modal>

          {addOpen && (
            <Modal
              open
              title="Add New Product"
              onClose={() => setAddOpen(false)}
              primaryAction={{
                content: "Save",
                onAction: async () => {
                  await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newProduct),
                  });
                  setAddOpen(false);

                  // Refresh products
                  const res = await fetch("/api/products");
                  setProducts(await res.json());
                },
              }}
            >
              <Modal.Section>
                <TextField
                  label="Title"
                  value={newProduct.title}
                  onChange={(v) => setNewProduct({ ...newProduct, title: v })}
                />
                <TextField
                  label="Description"
                  value={newProduct.description}
                  onChange={(v) =>
                    setNewProduct({ ...newProduct, description: v })
                  }
                />
                <TextField
                  label="Price"
                  type="number"
                  value={newProduct.price}
                  onChange={(v) => setNewProduct({ ...newProduct, price: v })}
                />
                <TextField
                  label="Category"
                  value={newProduct.category}
                  onChange={(v) =>
                    setNewProduct({ ...newProduct, category: v })
                  }
                />
                <TextField
                  label="Vendor"
                  value={newProduct.vendor}
                  onChange={(v) => setNewProduct({ ...newProduct, vendor: v })}
                />
                <TextField
                  label="Inventory"
                  type="number"
                  value={newProduct.inventory}
                  onChange={(v) =>
                    setNewProduct({ ...newProduct, inventory: v })
                  }
                />
                <TextField
                  label="Image URL"
                  value={newProduct.image}
                  onChange={(v) => setNewProduct({ ...newProduct, image: v })}
                />
              </Modal.Section>
            </Modal>
          )}

          {selectedProduct && (
            <Modal
              open
              onClose={() => {
                sendAnalytics("close", selectedProduct, setAnalytics);
                setSelectedProduct(null);
              }}
              title={selectedProduct.title}
              primaryAction={{
                content: "Close",
                onAction: () => {
                  sendAnalytics("close", selectedProduct, setAnalytics);
                  setSelectedProduct(null);
                },
              }}
            >
              <Modal.Section>
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{ flex: "0 0 220px" }}>
                    <img
                      src={selectedProduct.image || IMAGE_URL}
                      alt="product"
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text variant="headingMd" as="h2">
                      {selectedProduct.title}
                    </Text>
                    <Text>
                      <strong>Category:</strong> {selectedProduct.category}
                    </Text>
                    <Text>
                      <strong>Vendor:</strong> {selectedProduct.vendor}
                    </Text>
                    <Text>
                      <strong>Inventory:</strong> {selectedProduct.inventory}
                    </Text>
                    <div style={{ marginTop: 12 }}>
                      <Text>
                        <strong>Description:</strong>
                      </Text>
                      <div>{selectedProduct.description}</div>
                    </div>
                  </div>
                </div>
              </Modal.Section>
            </Modal>
          )}
        </Page>
      </Frame>
    </AppProvider>
  );
}
