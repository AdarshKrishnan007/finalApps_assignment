Project Description: Shopify Product Table ( Polaris + Next.js)

This project is a Shopify Product Table built using React, Next.js, and Shopify Polaris components. 
It simulates a product management interface where users can view, filter, and interact with products while tracking analytics.

Key Features:

Product Table:

Displays a list of products fetched from fakestoreapi.com.
Columns include product image, name, status (Active/Draft), inventory, type, and vendor.
Clicking a product opens a modal with detailed information.
Filters & Search
Text search for product names.
Filter by category, availability, vendor, and product type.
Filters can be applied via a modal for additional options.

Tabs

Products can be viewed by status: All, Active, Draft, Archived.
Tab selection dynamically updates the displayed products.
Analytics Tracking
Tracks product views and modal open/close times using a local analytics store (data.js).
Sends actions like open or close to the analytics API (route.js) and optionally to Gemini 3.
Enables monitoring user interactions and engagement.
Integration with Gemini 3 (Optional)
Actions like opening a product or closing a modal can be sent to Gemini 3 for real-time analytics or external dashboards.

UI Components

Built entirely with Shopify Polaris: Cards, Buttons, Tabs, Modals, Badges, IndexTable, and Select components.
Fully responsive and interactive, providing a professional admin experience.

Next.js Features

Server-side rendering for fast page loads.
API routes (route.js) handle analytics POST/GET requests.

Tech Stack:

Frontend: React, Next.js, Shopify Polaris
API / Backend: Next.js API routes (route.js)
State Management: React useState, useEffect
Deployment: Can be deployed on Netlify 

Use Case:
This dashboard is a demo/admin interface for e-commerce stores to manage products, monitor interactions, and analyze user behavior. It can be extended to real Shopify stores or integrated with other e-commerce platforms.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

