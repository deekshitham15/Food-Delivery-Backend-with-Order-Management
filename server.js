// const express = require('express');
// const app = express();
// const port = 3000;

// // Middleware to parse JSON
// app.use(express.json());

// // Root Route
// app.get('/', (req, res) => {
//   res.send('Food Delivery Backend with Order Management');
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const Joi = require('joi');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;


// Middleware to parse JSON
app.use(express.json());

// In-memory storage
const menu = [];
const orders = [];

// Validation Schemas
const menuSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid("Main Course", "Dessert", "Beverage").required(),
});

const orderSchema = Joi.object({
  itemIds: Joi.array().items(Joi.string().uuid()).required(),
});

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Food Delivery Backend!');
});

// Add or Update Menu Item (POST /menu)
app.post('/menu', (req, res) => {
  const { error, value } = menuSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, price, category } = value;

  // Check if the item already exists (based on name and category)
  let menuItem = menu.find(item => item.name === name && item.category === category);
  if (menuItem) {
    // Update existing item
    menuItem.price = price;
    return res.status(200).json(menuItem);
  }

  // Create new menu item
  const id = uuidv4();
  menuItem = { id, name, price, category };
  menu.push(menuItem);
  res.status(201).json(menuItem);
});

// Get All Menu Items (GET /menu)
app.get('/menu', (req, res) => {
  res.status(200).json(menu);
});

// Place an Order (POST /orders)
app.post('/orders', (req, res) => {
  const { error, value } = orderSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { itemIds } = value;

  // Validate that all item IDs exist in the menu
  const items = itemIds.map(id => menu.find(item => item.id === id));
  if (items.includes(undefined)) {
    return res.status(400).json({ error: "One or more item IDs are invalid." });
  }

  const id = uuidv4();
  const status = "Preparing";
  const timestamp = new Date().toISOString();

  const order = {
    id,
    items,
    status,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  orders.push(order);
  res.status(201).json(order);
});

// Get Order Details (GET /orders/:id)
app.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);

  if (!order) return res.status(404).json({ error: "Order not found." });

  res.status(200).json(order);
});

// Status Update with Cron Job
cron.schedule('*/1 * * * *', () => { // Runs every minute
  const now = new Date();

  orders.forEach(order => {
    const updatedAt = new Date(order.updatedAt);
    const minutesElapsed = Math.floor((now - updatedAt) / 1000 / 60); // Minutes elapsed

    if (order.status === "Preparing" && minutesElapsed >= 2) {
      order.status = "Out for Delivery";
      order.updatedAt = now.toISOString();
      console.log(`Order ${order.id} status updated to Out for Delivery.`);
    } else if (order.status === "Out for Delivery" && minutesElapsed >= 5) {
      order.status = "Delivered";
      order.updatedAt = now.toISOString();
      console.log(`Order ${order.id} status updated to Delivered.`);
    }
  });

  console.log("Cron job executed: Order statuses checked and updated if necessary.");
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
