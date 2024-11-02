import React,{useState, useEffect} from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Order.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function Order() {

  const navigate = useNavigate();

  const location = useLocation();
  const delivery_id = location.state || {};
  const [selectedForTruck, setSelectedForTruck] = useState([]);
  const [selectedForTrain, setSelectedForTrain] = useState([]);
  const [compOrders, setCompOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  
  useEffect(() => {
    pOrders();
    cOrders();
    recOrders();

    axios.get("/manager/profile",{withCredentials:true})
    .then((response) => {
    })
    .catch((error) => {
      navigate("/"); 
        console.error("Error fetching customer profile:", error);
    });
  }, []); 

  const handleCheckboxTrain = (event) => {
    const { value, checked } = event.target;

    setSelectedForTrain((prevSelectedCheckboxes) => {
      if (checked) {
        return prevSelectedCheckboxes.includes(value)
          ? prevSelectedCheckboxes 
          : [...prevSelectedCheckboxes, value]; 
      } else {
        return prevSelectedCheckboxes.filter((item) => item !== value);
      }
    });

  };

  const handleCheckboxTruck = (event) => {
    const { value, checked } = event.target;

    setSelectedForTruck((prevSelectedCheckboxes) => {
      if (checked) {
        // Add value only if it doesn't already exist
        return prevSelectedCheckboxes.includes(value)
          ? prevSelectedCheckboxes // Return existing state if already present
          : [...prevSelectedCheckboxes, value]; // Add the value if not present
      } else {
        // Remove the value if unchecked
        return prevSelectedCheckboxes.filter((item) => item !== value);
      }
    });

  };


  const pOrders = async () => {
    try {
      const response = await axios.get('/manager/paidOrders', { withCredentials: true });
      setPaidOrders(response.data);
    } catch (error) {
      console.error('Error getting orders', error.response ? error.response : error);
    }
  };

  const handleStatus = async (status) => {
    try {
      const response = await axios.post('/manager/changeOrderStatus', { status: status[0], Order_ID: status[1] },{ withCredentials: true });
    } catch (error) {
      console.error('Error sending request to backend:', error);
    }
  };

  const cOrders = async () => {
    try {
      const response = await axios.get('/manager/completedOrders', { withCredentials: true });
      setCompOrders(response.data);
    } catch (error) {
      console.error('Error getting orders', error.response ? error.response : error);
    }
  };

  const trackingToTruck = async () => {
    try {
      await axios.post('/manager/queueForDelivery', { orderList:selectedForTruck, delID:delivery_id }, { withCredentials: true });

      toast.success("Navigating to truck schedules!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      setTimeout(() => {
        navigate(`/delivery_schedule/truckScheduler/`, { 
          state: { delivery_id: delivery_id } 
        });
      }, 1000);

    } catch (error) {
      toast.error("Please create a delivery schedule!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      navigate(`/delivery_schedule/`);
    }
  };

  const trackingToTrain = async () => {

    try {
      await axios.post('/manager/queueForDelivery', { orderList:selectedForTrain, delID:delivery_id }, { withCredentials: true });

      toast.success("Navigating to truck schedules!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      setTimeout(() => {
        navigate(`/delivery_schedule/trainScheduler/`, { 
          state: { delivery_id: delivery_id } 
        });
      }, 1000);

    } catch (error) {
      toast.error("Please create a delivery schedule!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setTimeout(() => {
        navigate(`/delivery_schedule/`);
      }, 1500);
      console.error('Error sending request to backend:', error);
    }
  };

  const recOrders = async () => {
    try {
      const response = await axios.get('/manager/receivedOrders', { withCredentials: true });
      setReceivedOrders(response.data);
    } catch (error) {
      console.error('Error getting orders', error.response ? error.response : error);
    }
  };


  return (
    <div className='ADcontainer-order'>
      <div className='Acontainer-order'>
        {/* -----------Paid orders----------- */}
        <div className='order-content'>
          <h2>Paid Orders</h2>
          <table className='order-table'>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer_ID </th>
                <th>Route</th>
                <th>Ordered Date</th>
                <th>Expected Date</th>
                <th>Total Capacity</th>
                <th>Total Price</th>
                <th>Order State</th>
                <th>Add to track</th> 
              </tr>
            </thead>
            <tbody>
              {paidOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.Order_ID}</td>
                  <td>{order.Customer_ID}</td>
                  <td>{order.Route}</td>
                  <td>{new Date(order.Ordered_Date).toLocaleDateString()}</td>
                  <td>{new Date(order.Expected_Date).toLocaleDateString()}</td>
                  <td>{order.Total_Capacity}</td>
                  <td>{order.Total_Price}</td>
                  <td>
                    <div className='btn m-0.5' onClick={() => window.location.reload()}>{order.Order_state}</div>
                    <details className="dropdown">
                      <summary className="btn m-0.5 bg-green-500 hover:border-spacing-3">Change</summary>
                      <ul className="menu dropdown-content bg-base-100 bg-green-400 rounded z-[1] w-52 p-2 shadow">
                        <li><button onClick={() => handleStatus(['Paid', order.Order_ID])}>Paid</button></li>
                        <li><button onClick={() => handleStatus(['Received', order.Order_ID])}>Received</button></li>
                        <li><button onClick={() => handleStatus(['Completed', order.Order_ID])}>Completed</button></li>
                      </ul>
                    </details>
                  </td>
                  <td>    
                    <input
                      type="checkbox" 
                      defaultChecked 
                      className="checkbox checkbox-accent"
                      value={order.Order_ID}
                      checked={selectedForTrain.includes(order.Order_ID)}
                      onChange={handleCheckboxTrain}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='flex-row m-2'>
            <h4>Selected orders :</h4>
              {selectedForTrain.map((number) => (
                <span key={number}>{number}</span> // Use the number as the key
              ))}
          </div>
          <button className='btn btn-primary m-2 p-2' onClick={() => trackingToTrain()}>Track Orders to train</button>
        </div>
        {/* --------------Received orders-------------- */}
        <div className='order-content'>
        <h2>Received Orders</h2>
          <table className='order-table'>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer_ID </th>
                <th>Route</th>
                <th>Ordered Date</th>
                <th>Expected Date</th>
                <th>Total Capacity</th>
                <th>Total Price</th>
                <th>Order State</th>
                <th>Add to track</th>
              </tr>
            </thead>
            <tbody>
              {receivedOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.Order_ID}</td>
                  <td>{order.Customer_ID}</td>
                  <td>{order.Route}</td>
                  <td>{new Date(order.Ordered_Date).toLocaleDateString()}</td>
                  <td>{new Date(order.Expected_Date).toLocaleDateString()}</td>
                  <td>{order.Total_Capacity}</td>
                  <td>{order.Total_Price}</td>
                  <td>
                  <div className='btn m-0.5' onClick={() => window.location.reload()}>{order.Order_state}</div>
                    <details className="dropdown">
                      <summary className="btn m-0.5 bg-green-500 hover:border-spacing-3">Change</summary>
                      <ul className="menu dropdown-content bg-base-100 bg-green-400 rounded z-[1] w-52 p-2 shadow">
                        <li><button onClick={() => handleStatus(['Received', order.Order_ID])}>Received</button></li>
                        <li><button onClick={() => handleStatus(['Completed', order.Order_ID])}>Completed</button></li>
                      </ul>
                    </details>
                  </td>
                  <td>
                    <input
                      type="checkbox" 
                      defaultChecked 
                      className="checkbox checkbox-accent"
                      value={order.Order_ID}
                      checked={selectedForTruck.includes(order.Order_ID)}
                      onChange={handleCheckboxTruck}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='flex-row m-2'>
            <h4>Selected orders :</h4>
              {selectedForTruck.map((number) => (
                <span key={number}>{number}</span> // Use the number as the key
              ))}
          </div>
          <button className='btn btn-primary m-2 p-2' onClick={() => trackingToTruck()}>Track Orders to truck</button>
        </div>
        {/* --------------Completed orders-------------- */}
        <div className='order-content'>
        <h2>Completed Orders</h2>
          <table className='order-table'>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer_ID </th>
                <th>Route</th>
                <th>Ordered Date</th>
                <th>Expected Date</th>
                <th>Total Capacity</th>
                <th>Total Price</th>
                <th>Order State</th>
              </tr>
            </thead>
            <tbody>
              {compOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.Order_ID}</td>
                  <td>{order.Customer_ID}</td>
                  <td>{order.Route}</td>
                  <td>{new Date(order.Ordered_Date).toLocaleDateString()}</td>
                  <td>{new Date(order.Expected_Date).toLocaleDateString()}</td>
                  <td>{order.Total_Capacity}</td>
                  <td>{order.Total_Price}</td>
                  <td>{order.Order_state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* ------------------------- */}
      </div>
      <ToastContainer />
    </div>
  );
}

export default Order;