import pool from "../dbConfig.js";

class Customer {
  static async getProducts() {
    const query = "SELECT * FROM Product";
    try {
      const [results] = await pool.query(query); // Use await and destructuring
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async createOrder(request) {
    const {
      Customer_ID,
      Store_ID,
      Route_ID,
      Ordered_Date,
      Expected_Date,
      Total_Capacity,
      Total_Price,
    } = request.body;

    const query =
      "INSERT INTO Orders('Customer_ID', 'Store_ID', 'Route_ID', 'Ordered_Date', 'Expected_Date', 'Total_Capacity', 'Total_Price') VALUES (?, ?, ?, ?, ?, ?, ?)";

    try {
      const [results] = await pool.query(query, [
        Customer_ID,
        Store_ID,
        Route_ID,
        Ordered_Date,
        Expected_Date,
        Total_Capacity,
        Total_Price,
      ]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getOrders(req) {
    const { Customer_ID } = req.body;

    const query = `SELECT * FROM Orders WHERE Customer_ID=?`;

    try {
      const [results] = await pool.query(query, [Customer_ID]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getCustomer(Email) {
    const query = `SELECT * FROM Customer WHERE Email=?`;

    try {
      const [results] = await pool.query(query, [Email]);
      return results;
    } catch (error) {
      throw error;
    }
  }
  static async getCustomerByUsername(Username) {
    const query = `SELECT * FROM Customer WHERE Username=?`;

    try {
      const [results] = await pool.query(query, [Username]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async updateCustomer(req) {
    const { Customer_ID, Name, Phone_Number } = req.body;

    const query = `UPDATE Customer SET Name=?, Phone_Number=? WHERE Customer_ID=?`;

    try {
      const [results] = await pool.query(query, [
        Name,
        Phone_Number,
        Customer_ID,
      ]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async createCustomer(req, hashedPassword) {
    const { Name, Username, Password, Email, Phone_Number } = req.body;

    const query =
      "INSERT INTO Customer (Name, Username, Password, Email, Phone_Number) VALUES (?, ?, ?, ?, ?)";

    try {
      const [results] = await pool.query(query, [
        Name,
        Username,
        hashedPassword,
        Email,
        Phone_Number,
      ]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async addToCart({ Customer_ID, Product_ID, Quantity }) {
    const orderQuery = "INSERT INTO Orders (Customer_ID) VALUES (?)"; // Insert into Order table
    const orderItemQuery =
      "INSERT INTO Order_item (Product_ID, Order_ID, Quantity) VALUES (?, ?, ?)"; // Insert into Order_item table
    const checkCartQuery =
      "SELECT * FROM Orders WHERE Customer_ID = ? AND order_state = 'pending'"; // Check if there's a pending order

    try {
      // Check if there's an existing pending order
      const [existingCart] = await pool.query(checkCartQuery, [Customer_ID]);

      let orderId;

      if (existingCart.length > 0) {
        // Cart is not empty, use existing order ID
        orderId = existingCart[0].Order_ID;
        // Update quantity in existing order item
        await pool.query(orderItemQuery, [Product_ID, orderId, Quantity]);
      } else {
        // Cart is empty, create a new order
        const [orderResults] = await pool.query(orderQuery, [Customer_ID]);
        orderId = orderResults.insertId;
        // Insert new order item
        await pool.query(orderItemQuery, [Product_ID, orderId, Quantity]);
      }

      return {
        success: true,
        orderId: orderId, // Return the Order_ID
      };
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error; // You may want to handle errors more gracefully in production
    }
  }

  static async removeFromCart({ Customer_ID, Product_ID }) {
    const checkOrderQuery =
      "SELECT Order_ID FROM Orders WHERE Customer_ID = ? AND order_state = 'pending'";
    const removeItemQuery =
      "DELETE FROM Order_item WHERE Order_ID = ? AND Product_ID = ?";
    const checkItemsQuery = "SELECT * FROM Order_item WHERE Order_ID = ?";
    const deleteOrderQuery = "DELETE FROM Orders WHERE Order_ID = ?";

    try {
      // Get the existing order ID for the customer
      const [[order]] = await pool.query(checkOrderQuery, [Customer_ID]);

      if (!order) {
        return { success: false, message: "No active cart found." };
      }

      // Remove the item from the cart
      await pool.query(removeItemQuery, [order.Order_ID, Product_ID]);

      // Check if any items remain in the order
      const [remainingItems] = await pool.query(checkItemsQuery, [
        order.Order_ID,
      ]);

      // If no items remain, delete the order
      if (remainingItems.length === 0) {
        await pool.query(deleteOrderQuery, [order.Order_ID]);
      }

      return { success: true, message: "Item removed successfully." };
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw error; // You may want to handle errors more gracefully in production
    }
  }

  static async checkout(Customer_ID) {
    const updateOrderStateQuery =
      "UPDATE Orders SET order_state = 'paid' WHERE Customer_ID = ? AND order_state = 'pending'";

    try {
      // Update the order state to 'paid'
      const [results] = await pool.query(updateOrderStateQuery, [Customer_ID]);

      if (results.affectedRows === 0) {
        return {
          success: false,
          message: "No pending order found for checkout.",
        };
      }

      return { success: true, message: "Checkout successful." };
    } catch (error) {
      console.error("Error during checkout:", error);
      throw error; // You may want to handle errors more gracefully in production
    }
  }
}

export default Customer;