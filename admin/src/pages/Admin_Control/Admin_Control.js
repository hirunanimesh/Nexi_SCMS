import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin_Control.css";
import axios from "axios";
import Alert from "../../components/Alert/Alert";

const ManagerControl = () => {
  const navigate = useNavigate();

  const [managers, setManagers] = useState([]);
  const [stores, setStores] = useState([]);

  const [showRemoveAlert, setShowRemoveAlert] = useState(false);
  const [managerToRemove, setManagerToRemove] = useState(null);

  // Fetch managers and stores data from the backend
  useEffect(() => {
    axios
      .get("/admin/getManagers", { withCredentials: true })
      .then((response) => {setManagers(response.data);})
      .catch((error) => console.error("Error fetching managers:", error));

    // Fetch stores
    axios
      .get("/admin/stores", { withCredentials: true })
      .then((response) => {setStores(response.data); })
      .catch((error) => console.error("Error fetching stores:", error));
  }, []);

  // Remove a manager
  const removeManager = (Manager_ID) => {
    setShowRemoveAlert(true);
    setManagerToRemove(Manager_ID);
  };

  const confirmRemoveManager = () => {
    axios
      .delete(`/admin/remove/${managerToRemove}`, { withCredentials: true })
      .then(() => {
        setManagers(
          managers.filter((manager) => manager.Manager_ID !== managerToRemove)
        );
        setShowRemoveAlert(false);
        setManagerToRemove(null);
      })
      .catch((error) => {
        console.error("Error removing manager:", error);
        setShowRemoveAlert(false);
        setManagerToRemove(null);
      });
  };

  const cancelRemoveManager = () => {
    setShowRemoveAlert(false);
    setManagerToRemove(null);
  };

  // Add a new manager
  const addManager = () => {
    navigate('/signup')
  };

  return (
    <div className="manager-control">
      <h1 className="manager-control__title">Manager Control</h1>
      <div className="manager-header">
        <h2 className="manager-control__subtitle">Managers</h2>
        <button className="add-button" onClick={addManager}>
            Add Manager
        </button>  
      </div>
      <table className="manager-control__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Store</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {managers.map((manager) => (
            <tr key={manager.Manager_ID}>
              <td>{manager.Manager_ID}</td>
              <td>{manager.Name}</td>
              <td>{manager.PhoneNumber}</td>
              <td>{manager.Store_ID}</td>
              <td>
                {manager.Store_ID !== 7 && (
                  <button
                    className="manager-control__button"
                    onClick={() => removeManager(manager.Manager_ID)}
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="store-control__subtitle">Stores</h2>
      <table className="manager-control__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>City</th>
            <th>Trucks</th>
            <th>Drivers</th>
            <th>Assistants</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.Store_ID}>
              <td>{store.Store_ID}</td>
              <td>{store.City}</td>
              <td>{store.Truck}</td>
              <td>{store.Driver}</td>
              <td>{store.Assistant}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showRemoveAlert && (
        <Alert
          message="Are you sure you want to remove this manager?"
          onConfirm={confirmRemoveManager}
          onCancel={cancelRemoveManager}
        />
      )}
    </div>
  );
};

export default ManagerControl;
