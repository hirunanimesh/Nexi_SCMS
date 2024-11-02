import pool from "../dbConfig.js";

class Manager {
  static async getManager(Username) {
    const query = `SELECT * FROM store_manager WHERE Username=?`;

    try {
      const [results] = await pool.query(query, [Username]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getEmail(Email) {
    const query = `SELECT * FROM store_manager WHERE Email=?`;

    try {
      const [results] = await pool.query(query, [Email]);

      return results;
    } catch (error) {
      throw error;
    }
  }

  //model for getting the most orders
  static async getMostOrders(req) {
    const query = `SELECT * FROM product_orders;`;
    try {
      const [rows] = await pool.query(query); // Only get the rows part
      // Print rows for debugging
      return rows; // Return only rows
    } catch (error) {
      throw error;
    }
  }

  static async getManagerByUsername(Username) {
    const query = `SELECT * FROM store_manager WHERE Username=?`;

    try {
      const [results] = await pool.query(query, [Username]);

      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getManagerByStore(City) {
    const query = `CALL getManagerByStore(?)`;

    try {
      const [results] = await pool.query(query, [City]);

      return results[0];
    } catch (error) {
      throw error;
    }
  }

  static async createManager(req, hashedPassword) {
    const { Name, Username, City, Password, Email, Phone_Number } = req.body;

    const query = "CALL InsertManager(?, ?, ?, ?, ?, ?)";

    try {
      const [results] = await pool.query(query, [
        Name,
        Username,
        hashedPassword,
        Email,
        Phone_Number,
        City,
      ]);

      return results;
    } catch (error) {
      throw error;
    }
  }

  //model for get the assistant worked hours
  static async getAssistantWorkHours(Store_ID) {
    const query = `call AssistantHoursByCity(?);`; // Query the view directly
    try {
      const [rows] = await pool.query(query,[Store_ID]); // Execute the query and return rows
      return rows[0]; // Return only rows
    } catch (error) {
      console.error("Error in getAssistantWorkHours:", error);
      throw error;
    }
  }


// model for getting the quarterly sales
static async getQuarterlySales(req, storeID) {
  const { startDate } = req.query; // Get startDate from request query
  const query = `CALL Quarterly_sales_from(?, ?)`; // Updated procedure call with two parameters
  try {
    const [rows] = await pool.query(query, [startDate, storeID]); // Pass both startDate and storeID
   
    return rows[0]; // Return only the first element of rows
  } catch (error) {
    console.error("Error in getQuarterlySales:", error);
    throw error;
  }
}

  // Model function to get truck hours
  static async getTruckHours(Store_ID) {
    const query = `call TruckHoursByCity(?)`; // Query the view directly

    try {
      const [rows] = await pool.query(query,[Store_ID]); // Execute the query and return rows
      return rows[0]; // Return only rows
    } catch (error) {
      console.error("Error in getTruckHours:", error);
      throw error;
    }
  }

  // Function to get the total hours worked by each driver
  static async getDriverWorkHours(Store_ID) {
    const query = `call DriverHoursByCity(?);`; // Query the view directly
    try {
      const [rows] = await pool.query(query,[Store_ID]); // Execute the query and return rows
      return rows[0]; // Return only rows
    } catch (error) {
      console.error("Error in getDriverWorkHours:", error);
      throw error;
    }
  }
  // Model function to get sales by city
  static async getSalesByCity() {
    const query = `SELECT * FROM sales_by_city`; // Query the view directly

    try {
      const [rows] = await pool.query(query); // Execute the query and return rows
      return rows; // Return only rows
    } catch (error) {
      console.error("Error in getSalesByCity:", error);
      throw error;
    }
  }

  // Model function to get sales by route
  static async getSalesByRoute(st) {
    
    const query = `SELECT Route,Total_Sales FROM sales_by_route where Store_ID=?`; 
    

    try {
      const [rows] = await pool.query(query,st); // Execute the query and return rows
      return rows; // Return only rows
    } catch (error) {
      console.error("Error in getSalesByRoute:", error);
      throw error;
    }
  }

  // Model function to get order count by customer
  static async getOrderCountByCustomer(storeID) {
    const query = `CALL GetOrderCountByCustomer(?);`; // Query the view directly

    try {
      const [rows] = await pool.query(query, [storeID]); // Execute the query and return rows
      return rows[0]; // Return only the data portion of the result
    } catch (error) {
      console.error("Error in getOrderCountByCustomer:", error);
      throw error;
    }
  }

  static async getIncompletedTrainOrders(req) {
    // get the orders which does not have a train assigned the state is not delivered
    const query = `Select *  from Delivery_Schedule where Delivery_status='On_Train`;

    try {
      const result = await pool.query(query, null);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getPaidOrders(id) {
    const query = `select *  
            from Orders 
            JOIN truck_route ON Orders.Route_ID = truck_route.Route_ID
            WHERE 
                Order_state='Paid' AND orders.Store_ID=?`;
    try {
      const result = await pool.query(query, id);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  static async getTruckDelivery(storeID) {
    const query = `SELECT 
              td.ID AS ID,
              td.Truck_Del_ID AS Truck_Del_ID,
              td.Truck_id AS Truck_id,
              td.Driver_id AS Driver_id,
              d.Driver_Name AS Driver_name,
              td.Assistant_id AS Assistant_id,
              da.Assistant_Name AS Assistant_name
            FROM truck_delivery td
            INNER JOIN Driver_Assistant da ON td.Assistant_id = da.Assistant_id
            INNER JOIN Driver d ON td.Driver_id = d.Driver_ID
            WHERE da.Store_ID = ? AND d.Store_ID = ?;`;
    try {
      const result = await pool.query(query, [storeID, storeID]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  static async addDeliverySchedule(store_id) {
    const query = `INSERT INTO Delivery_Schedule (Store_ID, shipment_date, Delivery_status) VALUES (?, CURDATE(), 'Not_Yet');`;

   try {
      const result = await pool.query(query, [store_id]);
      return result;
   } catch (error) {
      console.error("Error adding delivery schedule:", error.message);
      throw error;
   }
}

  static async updateArrivalTime(deliveryID) {
    const query = `CALL Update_arrival_time(?);`;
    try {
      const result = await pool.query(query, [deliveryID]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteDelivery(delID) {
    const query = `DELETE FROM delivery_schedule WHERE Delivery_id = ?`;
    try {
      const result = await pool.query(query, delID);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getDeliverySchedule(date,store_id) {
    const query = `select * from Delivery_Schedule where shipment_date=? and Store_ID=?`;
    try {
      const result = await pool.query(query, [date,store_id]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  static async addTruckDelivery(storeID, delivery_id) {
    const query = "call CreateTruckDelivery(?,?)";
    try {
      const result = await pool.query(query, [storeID, delivery_id]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async addTrainDelivery(delivery_id, train_id) {
    const query = `CALL createTrainSchedule(?, ?);`;
    try {
      const result = await pool.query(query, [delivery_id, train_id]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteTruck(delID) {
    const query = `DELETE FROM truck_delivery WHERE ID = ?`;
    try {
      const result = await pool.query(query, delID);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async setDeliveryStatus(status, Delivery_id) {
    const query = `update Delivery_Schedule set Delivery_status=? where Delivery_id=?`;
    try {
      const result = await pool.query(query, [status, Delivery_id]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async changeOrderStatus(status, orderID) {
    const query = `update orders set Order_state=? where Order_id=?`;
    try {
      const result = await pool.query(query, [status, orderID]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getCompletedOrders(storeID) {
    const query = `select *  
            from Orders 
            JOIN truck_route ON Orders.Route_ID = truck_route.Route_ID
            WHERE 
                Order_state='Completed' AND orders.Store_ID=?`;
    try {
      const result = await pool.query(query, storeID);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  static async getReceivedOrders(storeID) {
    const query = `select *  
            from Orders 
            JOIN truck_route ON Orders.Route_ID = truck_route.Route_ID
            WHERE 
                Order_state='Received' AND orders.Store_ID=?;`;
    try {
      const result = await pool.query(query, storeID);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  static async releaseAll(deliveryID) {
    const query = `CALL release_workers(?)`;
    try {
      const result = await pool.query(query, deliveryID);
      return result;
    }catch (error) {
      throw error;
    }
  }

  static async addToDeliveryQueue(orderList, delID) {
    const placeholders = orderList.map(() => "(?, ?)").join(", ");
    const oList = orderList.map((str) => parseInt(str));
    const query = `INSERT INTO order_delivery (Delivery_ID, Order_ID) VALUES ${placeholders}`;

    const values = oList.flatMap((e) => [delID, e]);
    try {
      const result = await pool.query(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // ----------------------------------------------------------------------

  // Function to get trains by Store_ID using the stored procedure
  static async getTrains(storeID) {
    const query = `CALL getTrainsByStoreID(?)`;
    const values = [storeID];
    try {
      const result = await pool.query(query, values);
      return result[0][0]; // Stored procedure returns results as an array of arrays
    } catch (error) {
      throw error;
    }
  }

  // Function to get drivers by city using the stored procedure
  static async getDrivers(city) {
    const query = `CALL getDriversByCity(?)`;

    try {
      const result = await pool.query(query, [city]);
      return result[0]; // Stored procedure returns results as an array of arrays
    } catch (error) {
      throw error;
    }
  }

  static async getDriversbyStore(Store_id) {
    const query = "Select * from driver where Store_id = ?";

    try {
      const [results] = await pool.query(query, [Store_id]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Function to get driver assistants by city using the stored procedure
  static async getAssistants(city) {
    const query = `CALL getAssistantsByCity(?)`;

    try {
      const result = await pool.query(query, [city]);
      return result[0]; // Stored procedure returns results as an array of arrays
    } catch (error) {
      throw error;
    }
  }

  static async getAssistantsbyStore(Store_id) {
    const query = "Select * from driver_assistant where Store_id = ?";

    try {
      const [results] = await pool.query(query, [Store_id]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Function to get vehicles by city using the stored procedure
  static async getVehicles(city) {
    const query = `CALL getVehiclesByCity(?)`;

    try {
      const result = await pool.query(query, [city]);
      return result[0]; // Stored procedure returns results as an array of arrays
    } catch (error) {
      throw error;
    }
  }


  static async getAdminDetails(adminID) {
    // Add adminId as a parameter

    const query = `CALL GetAdminDetails(?)`;

    try {
      const result = await pool.query(query, [adminID]);
      return result[0][0][0];
    } catch (error) {
      throw error;
    }
  }

  // Function to get availability counts by store ID using the stored procedure
  static async getAvailabilityCounts(storeID) {
    const query = `CALL GetAvailabilityCounts(?)`;

    try {
      const result = await pool.query(query, [storeID]);
      return result[0][0][0];
    } catch (error) {
      throw error;
    }
  }

  static async IncompletedTrainOrders(storeID) {
    const query = "call GetIncompleteOrders(?)";
    try {
      const result = await pool.query(query, [storeID]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  static async insertDrivers(Driver_Name, Store_ID) {
    const query = "INSERT INTO driver (Driver_Name, Store_ID) VALUES (?,?)";
    try {
      const [results] = await pool.query(query, [Driver_Name, Store_ID]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async insertAssistants(Assistant_Name, Store_ID) {
    const query =
      "INSERT INTO driver_assistant (Assistant_Name, Store_ID) VALUES (?,?)";
    try {
      const [results] = await pool.query(query, [Assistant_Name, Store_ID]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async removeDriver(Driver_ID) {
    const query = "DELETE FROM driver WHERE Driver_ID = ?";
    try {
      const [results] = await pool.query(query, [Driver_ID]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async removeAssistant(Assistant_ID) {
    const query = "DELETE FROM driver_assistant WHERE Assistant_ID = ?";
    try {
      const [results] = await pool.query(query, [Assistant_ID]);
      return results;
    } catch (error) {
      throw error;
    }
  }
}



export default Manager;
