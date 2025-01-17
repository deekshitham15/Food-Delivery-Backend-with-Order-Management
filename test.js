const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Add a menu item
const addMenuItem = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/menu`, {
      name: 'Burger',
      price: 9.99,
      category: 'Main Course',
    });
    console.log('Menu Item Added:', response.data);
    return response.data.id; // Return the ID for further use
  } catch (error) {
    if (error.response) {
      console.error('Error adding menu item:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Get all menu items
const getMenuItems = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/menu`);
    console.log('Menu Items:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error fetching menu:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Place an order
const placeOrder = async (itemIds) => {
  try {
    const response = await axios.post(`${BASE_URL}/orders`, { itemIds });
    console.log('Order Placed:', response.data);
    return response.data.id; // Return the Order ID
  } catch (error) {
    if (error.response) {
      console.error('Error placing order:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Get order details
const getOrder = async (orderId) => {
  try {
    const response = await axios.get(`${BASE_URL}/orders/${orderId}`);
    console.log('Order Details:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error fetching order:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Test Workflow
(async () => {
  // Step 1: Add Menu Item
  const menuItemId = await addMenuItem();
  if (!menuItemId) return; // Exit if adding menu item failed

  // Step 2: Get Menu Items
  const menuItems = await getMenuItems();
  if (!menuItems || menuItems.length === 0) return; // Exit if fetching menu failed

  // Step 3: Place Order with the newly added menu item
  const orderId = await placeOrder([menuItemId]);
  if (!orderId) return; // Exit if placing order failed

  // Step 4: Fetch Order Details after a delay (e.g., 3 seconds)
  setTimeout(() => getOrder(orderId), 3000);
})();
