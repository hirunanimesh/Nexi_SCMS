import "./Driver.css";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Alert from "../../components/Alert/Alert";

function Driver() {
  const navigate = useNavigate();

  // State to store driver data
  const [drivers, setDrivers] = useState([]);
  const [newDriverName, setNewDriverName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axios
      .get("/manager/driversofstore", { withCredentials: true })
      .then((response) => {
        setDrivers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        navigate("/");
      });
  }, [drivers]);

  const removeDriver = (Driver_ID) => {
    setShowRemoveAlert(true);
    setDriverToRemove(Driver_ID);
  };

  const confirmRemoveDriver = () => {
    axios
      .delete(`/manager/driver/remove/${driverToRemove}`, { withCredentials: true })
      .then(() => {
        setDrivers(drivers.filter((driver) => driver.Driver_ID !== driverToRemove));
        setShowRemoveAlert(false);
        setDriverToRemove(null);
      })
      .catch((error) => {
        console.error("Error removing driver:", error);
        setShowRemoveAlert(false);
        setDriverToRemove(null);
      });
  };

  const cancelRemoveDriver = () => {
    setShowRemoveAlert(false);
    setDriverToRemove(null);
  };

  const [showRemoveAlert, setShowRemoveAlert] = useState(false);
  const [driverToRemove, setDriverToRemove] = useState(null);

  const [showAddAlert, setShowAddAlert] = useState(false);

  const addDriver = () => {
    if (!newDriverName) {
      setErrorMessage("Please enter a driver name.");

      // Clear the error message after 3 seconds
      setTimeout(() => {
        setErrorMessage("");
      }, 1000);

      return;
    }
    setErrorMessage("");
    setShowAddAlert(true);
  };

  const confirmAddDriver = () => {
    axios
      .post(
        "/manager/driver/insert",
        { Driver_Name: newDriverName },
        { withCredentials: true }
      )
      .then((response) => {
        setDrivers([...drivers, response.data]);
        setNewDriverName("");
        setShowAddAlert(false);
      })
      .catch((error) => {
        console.error("Error adding driver:", error);
        setShowAddAlert(false);
      });
  };

  const cancelAddDriver = () => {
    setShowAddAlert(false);
  };

  return (
    <div className="driver-container">
      <h1 className="driver-title">Drivers of store</h1>
      <div className="driver-content">
        <table className="driver-table">
          <thead className="driver-table-head">
            <tr className="driver-table-row">
              <th className="driver-table-header">Driver ID</th>
              <th className="driver-table-header">Driver Name</th>
              <th className="driver-table-header">Total Work Hours</th>
              <th className="driver-table-header">Driver Status</th>
              <th className="driver-table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="driver-table-body">
            {drivers.map((driver) => (
              <tr key={driver.Driver_ID} className="driver-table-row">
                <td className="driver-table-data">{driver.Driver_ID}</td>
                <td className="driver-table-data">{driver.Driver_Name}</td>
                <td className="driver-table-data">{driver.Work_Hours}</td>
                <td className="driver-table-data">{driver.Availability}</td>
                <td className="driver-table-data">
                  <button
                    className="remove-button"
                    onClick={() => removeDriver(driver.Driver_ID)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="add-driver">
        <input
          type="text"
          value={newDriverName}
          onChange={(e) => setNewDriverName(e.target.value)}
          placeholder="Enter driver name"
        />
        <button className="add-driver-button" onClick={addDriver}>
          Add Driver
        </button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
      {showRemoveAlert && (
        <Alert
          message="Are you sure you want to remove this driver?"
          onConfirm={confirmRemoveDriver}
          onCancel={cancelRemoveDriver}
        />
      )}
      {showAddAlert && (
        <Alert
          message="Are you sure you want to add this driver?"
          onConfirm={confirmAddDriver}
          onCancel={cancelAddDriver}
        />
      )}
    </div>
  );
}

export default Driver;
