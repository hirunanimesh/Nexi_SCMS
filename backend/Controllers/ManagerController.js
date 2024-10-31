import Manager from "../Models/ManagerModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../Models/AdminModel.js";

// Controller to get incomplete train orders

async function getIncompletedTrainOrders(req, res) {
  try {
    const result = await Manager.getIncompletedTrainOrders(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching incomplete train orders",
      error: error.message,
    });
  }
}
//controller to get hours of assistants
async function getAssistantWorkedHours(req, res) {
  const storeID = req.user.store; // Extract storeID from token payload
  try {
    const result = await Manager.getAssistantWorkHours(storeID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching assistant worked hours",
      error: error.message,
    });
  }
}

//controller to get hours of drivers
async function getDriverWorkedHours(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getDriverWorkHours(storeID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching driver worked hours",
      error: error.message,
    });
  }
}

//controller to get most orders
async function getMostOrders(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getMostOrders(req,storeID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching most orders", error: error.message });
  }
}

// //controller to get quaterly sales
async function getQuarterlySales(req, res) {
  const storeID = req.user.store; // Extract storeID from token payload
  
  try {
    const result = await Manager.getQuarterlySales(req, storeID); // Pass storeID to the model
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching quarterly sales",
      error: error.message,
    });
  }
}

// Controller function to get truck hours
async function getTruckHours(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getTruckHours(storeID);
    res.status(200).json(result); // Send the retrieved data to the frontend
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching truck hours", error: error.message });
  }
}

// Controller function to get sales by city

async function getSalesByCity(req, res) {
  try {
    const result = await Manager.getSalesByCity();
    res.status(200).json(result); // Send the retrieved data to the frontend
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sales by city", error: error.message });
  }
}
// Controller function to get sales by route
async function getSalesByRoute(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getSalesByRoute(storeID);
    res.status(200).json(result); // Send the retrieved data to the frontend
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sales by route", error: error.message });
  }
}
// Controller function to get customer order count report
async function getCustomerOrderReport(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getOrderCountByCustomer(storeID);
    res.status(200).json(result); // Send the retrieved data to the frontend
  } catch (error) {
    res.status(500).json({
      message: "Error fetching customer order report",
      error: error.message,
    });
  }
}

// Controller to get all orders
async function getPaidOrders(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getPaidOrders(storeID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
}

async function getTruckDelivery(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getTruckDelivery(storeID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching truck delivery", error: error.message });
  }
}

async function addDeliverySchedule(req, res) {
  try {
    const result = await Manager.addDeliverySchedule(req.user.store);
    res
      .status(201)
      .json({ message: "Delivery schedule added successfully", data: result });
  } catch (error) {
    res.status(500).json({
      message: "Error adding delivery schedule",
      error: error.message,
    });
  }
}

async function deleteDelivery(req, res) {
  const delID = req.body.deliveryID;
  try {
    const result = await Manager.deleteDelivery(delID);
    res.status(204).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error deleting delivery schedule",
      error: error.message,
    });
  }
}

// Controller to get the delivery schedule
async function getDeliverySchedule(req, res) {
  const date = req.params.date;
  const storeID = req.user.store;
  try {
    const result = await Manager.getDeliverySchedule(date, storeID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching delivery schedule",
      error: error.message,
    });
  }
}

async function setDeliveryStatus(req, res) {
  const status = req.body.status;
  const delID = req.body.Delivery_id;
  try {
    const result = await Manager.setDeliveryStatus(status, delID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error updating delivery status",
      error: error.message,
    });
  }
}

// Controller to add a new delivery schedule
async function addTruckDelivery(req, res) {
  const storeID = req.user.store;
  const delID = req.body.delivery_id.delivery_id.delivery_id;
  try {
    const result = await Manager.addTruckDelivery(storeID, delID);
    res
      .status(201)
      .json({ message: "Delivery schedule added successfully", data: result });
  } catch (error) {
    res.status(500).json({
      message: "Error adding delivery schedule",
      error: error.message,
    });
  }
}

async function addTrainDelivery(req, res) {
  const { trainID, delID } = req.body;
  const deliveryID = delID.delivery_id.delivery_id;
  try {
    const result = await Manager.addTrainDelivery(deliveryID, trainID);
    res
      .status(201)
      .json({ message: "Delivery schedule added successfully", data: result });
  } catch (error) {
    res.status(500).json({
      message: "Error adding delivery schedule",
      error: error.message,
    });
  }
}

async function deleteTruckDelivery(req, res) {
  const delID = req.body.ID;
  try {
    const result = await Manager.deleteTruck(delID);
    res.status(204).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error deleting delivery schedule",
      error: error.message,
    });
  }
}

// Controller to change order status to "In Truck"
async function changeOrderStatus(req, res) {
  const { status, Order_ID } = req.body;
  try {
    const result = await Manager.changeOrderStatus(status, Order_ID);
    res.status(200).json({ message: "Order status changed", data: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
}

async function getCompletedOrders(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getCompletedOrders(storeID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
}

async function getReceivedOrders(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getReceivedOrders(storeID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
}

async function releaseAll(req, res) {
  const delID = req.body.deliveryID;
  try {
    const result = await Manager.releaseAll(delID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
}

async function addToDeliveryQueue(req, res) {
  const { orderList, delID } = req.body;
  const deliveryID = delID.delivery_id;
  try {
    const result = await Manager.addToDeliveryQueue(orderList, deliveryID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
}

async function updateArrivalTime(req, res) {
  const { deliveryID } = req.body;
  try {
    const result = await Manager.updateArrivalTime(deliveryID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
}

// Controller to get trains for a specific store
async function getTrains(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getTrains(storeID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching trains", error: error.message });
  }
}

// Controller to get drivers for a specific city
async function getDrivers(req, res) {
  const { city } = req.params;
  try {
    const result = await Manager.getDrivers(city);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: `Error fetching drivers for city: ${city}`,
      error: error.message,
    });
  }
}

async function getDriversOfStore(req, res) {
  const storeID = req.user.store;

  try {
    const result = await Manager.getDriversbyStore(storeID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: `Error fetching drivers for store: ${storeID}`,
      error: error.message,
    });
  }
}

// Controller to get assistant drivers for a specific city
async function getAssistants(req, res) {
  const { city } = req.params;
  try {
    const result = await Manager.getAssistants(city);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: `Error fetching assistants for city: ${city}`,
      error: error.message,
    });
  }
}

async function getAssistsantsOfStore(req, res) {
  const storeID = req.user.store;

  try {
    const result = await Manager.getAssistantsbyStore(storeID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: `Error fetching Assistants for store: ${storeID}`,
      error: error.message,
    });
  }
}

// Controller to get vehicles for a specific city
async function getVehicles(req, res) {
  const { city } = req.params;
  try {
    const result = await Manager.getVehicles(city);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: `Error fetching vehicles for city: ${city}`,
      error: error.message,
    });
  }
}

async function getProfile(req, res) {
  try {
    req = req.user.username;
    const profile = await Manager.getManager(req);
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
}

async function manager_login(req, res) {
  const { Username, Password } = req.body;

  const [manager] = await Manager.getManager(Username);
  const [admin] = await Admin.getAdmin(Username);

  // If no manager is found, return an error response
  if (!manager) {
    return res
      .status(401)
      .json({ message: "Invalid credentials", success: false });
  }

  // Check if the password is correct
  const match = await bcrypt.compare(Password, manager.Password);
  if (!match) {
    return res
      .status(401)
      .json({ message: "Invalid credentials", success: false });
  }
  

  // Determine the role and create a token
  const isAdmin = admin && admin.Store_ID === manager.Store_ID;
  const role = isAdmin ? "Admin" : "Manager";
  const token = jwt.sign(
    {
      id: manager.Manager_ID,
      username: manager.Username,
      store: manager.Store_ID,
      role: role,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );

  // Set token in cookies
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(200).json({ success: true });
}


async function manager_logout(req, res) {
  // Clear the token cookie

  res.cookie("token", " ", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0), // Set to expire immediately
  });

  return res.status(200).json({ message: "Logout successful", success: true });
}

async function getAdminDetails(req, res) {
  const adminID = req.user.id;

  try {
    const result = await Manager.getAdminDetails(adminID);
    res.status(200).json({ result, role: req.user.role });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error fetching admin details", error: error.message });
  }
}


async function manager_signup(req, res) {
  const { Name, Username, City, Password, Email, Address, Phone_Number } =
    req.body;

  // Check if email or username already exists
  const [existingEmail] = await Manager.getEmail(Email);

  const [existingUsername] = await Manager.getManagerByUsername(Username);

  const [existingManager] = await Manager.getManagerByStore(City);

  if (existingEmail) {
    return res.status(400).json({ message: "Email already exists" });
  }

  if (existingUsername) {
    return res.status(400).json({ message: "Username already exists" });
  }

  if (existingManager) {
    return res.status(400).json({ message: "Store Manager already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(Password, 10);

  // Insert new user into the database
  Manager.createManager(req, hashedPassword);

  res.status(201).json({ message: "User registered successfully" });
}

// Controller to get availability counts by store ID
async function getAvailabilityCounts(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.getAvailabilityCounts(storeID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching availability counts",
      error: error.message,
    });
  }
}

async function getIncompleteOrdersForStore(req, res) {
  const storeID = req.user.store;
  try {
    const result = await Manager.IncompletedTrainOrders(storeID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching incomplete orders",
        error: error.message,
      });
  }
}

async function insertDriver(req, res) {
  const { Driver_Name } = req.body;
  const Store_ID = req.user.store;
  try {
    const result = await Manager.insertDrivers(Driver_Name, Store_ID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error inserting drivers", error: error.message });
  }
}
async function insertAssistant(req, res) {
  const { Assistant_Name } = req.body;
  const Store_ID = req.user.store;
  try {
    const result = await Manager.insertAssistants(Assistant_Name, Store_ID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error inserting assistants", error: error.message });
  }
}

async function removeDriver(req, res) {
  const { Driver_ID } = req.params;
  try {
    const result = await Manager.removeDriver(Driver_ID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing drivers", error: error.message });
  }
}

async function removeAssistant(req, res) {
  const { Assistant_ID } = req.params;
  try {
    const result = await Manager.removeAssistant(Assistant_ID);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing assistants", error: error.message });
  }
}

export {
  getPaidOrders,
  getTruckDelivery,
  addDeliverySchedule,
  deleteDelivery,
  getDeliverySchedule,
  setDeliveryStatus,
  addTruckDelivery,
  addTrainDelivery,
  deleteTruckDelivery,
  changeOrderStatus,
  getCompletedOrders,
  getReceivedOrders,
  releaseAll,
  addToDeliveryQueue,
  updateArrivalTime,
  getTrains,
  getDrivers,
  getAssistants,
  getVehicles,
  manager_login,
  manager_signup,
  getQuarterlySales,
  getAdminDetails,
  getDriversOfStore,
  getAssistsantsOfStore,
  manager_logout,
  getProfile,
  getMostOrders,
  getDriverWorkedHours,
  getAssistantWorkedHours,
  getTruckHours,
  getSalesByCity,
  getSalesByRoute,
  getCustomerOrderReport,
  getAvailabilityCounts,
  getIncompletedTrainOrders,
  getIncompleteOrdersForStore,
  removeAssistant,
  insertDriver,
  removeDriver,
  insertAssistant,
};
