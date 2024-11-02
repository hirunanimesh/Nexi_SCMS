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
    const { Customer_ID, Name, Phone_Number } = req;
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
      "SELECT * FROM Orders WHERE Customer_ID = ? AND order_state = 'Pending'"; // Check if there's a pending order

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

  static async getCart(Customer_ID) {
    const query = `
        SELECT product.product_id as product_id, product_name, image_link, Price AS unit_price, SUM(Order_item.Quantity) AS total_quantity
        FROM Order_item
        JOIN Orders 
            ON Order_item.Order_ID = Orders.Order_ID
        JOIN Product
            ON Order_item.Product_ID = Product.Product_ID
        WHERE Orders.Customer_ID = ?
        AND Orders.order_state = 'Pending'
        GROUP BY Product.Product_ID, Product.Product_name, Product.Image_Link, Product.Price;
    `;
    try {
      const [results] = await pool.query(query, [Customer_ID]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async removeFromCart({ Customer_ID, Product_ID }) {
    const checkOrderQuery =
      "SELECT Order_ID FROM Orders WHERE Customer_ID = ? AND order_state = 'Pending'";
    const removeItemQuery =
      "DELETE FROM Order_item WHERE Order_ID = ? AND Product_ID = ?";
    const checkItemsQuery = "SELECT * FROM Order_item WHERE Order_ID = ?";
    const deleteOrderQuery = "DELETE FROM Orders WHERE Order_ID = ?";

    try {
      // Get the existing order ID for the customer
      const [orderResults] = await pool.query(checkOrderQuery, [Customer_ID]);

      // Check if an order exists
      if (orderResults.length === 0) {
        return { success: false, message: "No active cart found." };
      }

      const order = orderResults[0]; // Assuming one active order per customer

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
      throw error; // Consider more detailed error handling for production
    }
  }

  static async checkout(Customer_ID, Store_ID, Route_ID) {
    const updateOrderStateQuery = `call CheckoutOrder(?, ?, ?)`;
    try {
      // Update the order state to 'paid' using separate values for each placeholder
      const [results] = await pool.query(updateOrderStateQuery, [
        Customer_ID,
        Store_ID,
        Route_ID,
      ]);

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

  // Function to get the current (pending) order
  static async getCurrentOrder(customerId) {
    const query = `CALL GetCurrentOrder(?);`;
    try {
      const [results] = await pool.query(query, [customerId]);
      return results[0]; // results[0] returns the first result set from CALL
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentOrderItem(orderId) {
    const query = `CALL GetCurrentOrderItem(?);`
    try {
      const [results] = await pool.query(query, [orderId]);
      return results[0]; // results[0] returns the first result set from CALL
    } catch (error) {
      throw error;
    }
  }

  static async getPreviousOrder(customerId) {
    const query = `CALL GetPreviousOrder(?);`;
    
    try {
      const [results] = await pool.query(query, [customerId]);
      
      return results[0]; // results[0] returns the first result set from CALL

    } catch (error) {
      throw error;
    }
  }

  static async getStores() {
    const query = "SELECT * FROM Store";
    try {
      const [results] = await pool.query(query);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getRoutes() {
    const query = "SELECT * FROM Truck_route";
    try {
      const [results] = await pool.query(query);
      return results;
    } catch (error) {
      throw error;
    }
  }


}



export default Customer;
