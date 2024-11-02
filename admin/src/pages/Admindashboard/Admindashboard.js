import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default styles for the calendar
import './Admindashboard.css';
import { useNavigate } from "react-router-dom";

function Admindashboard() {

  const navigate = useNavigate();

  const [storeID, setStoreID] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [totalAssistants, setTotalAssistants] = useState(0);
  const [activeAssistants, setActiveAssistants] = useState(0);
  const [activeTrucks, setActiveTrucks] = useState(0);
  const [totalTrucks, setTotalTrucks] = useState(0);
  const [incompleteOrders, setIncompleteOrders] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [date, setDate] = useState(new Date());
  const [incompleteOrdersList, setIncompleteOrdersList] = useState([]);


  useEffect(() => {
    axios.get("/manager/profile",{withCredentials:true})
    .then((response) => {
    })
    .catch((error) => {
      navigate("/"); 
        console.error("Error fetching customer profile:", error);
    });
  }, []); 

  useEffect(() => {
    const fetchData = async () => {
      try { 
        await axios.get('/manager/admindetails', { withCredentials: true })
          .then((res) => {
            setStoreID(res.data.result.Store_ID);
            setStoreCity(res.data.result.City);
            fetchData1();
            fetchData2();
          });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchData1 = async () => {
      try{
        await axios.get('/manager/availabilityCounts', { withCredentials: true })
        .then((res) => {
          setActiveDrivers(res.data.Available_Drivers);
          setActiveAssistants(res.data.Available_Assistants);
          setActiveTrucks(res.data.Available_Trucks);
          setTotalDrivers(res.data.Total_Drivers);
          setTotalAssistants(res.data.Total_Assistants);
          setTotalTrucks(res.data.Total_Trucks);
        })
        .catch((error) => {
          console.error('Error fetching availability counts:', error);
        });        
      }
      catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchData2 = async () => {
      try {
        axios.get('manager/incompleteOrders', { withCredentials: true })
        .then((res) => {
            setIncompleteOrdersList(res.data[2].map(order => ({
            id: order.Order_ID,
            customer: order.Customer_ID,
            routeId: order.Route_ID,
            status: order.Order_state
            })));
            setTotalOrders(res.data[0][0].Total_Order_Count);
            setIncompleteOrders(res.data[1][0].Incomplete_Order_Count)
        }).catch((error) => {
          console.error('Error fetching incomplete orders:', error);
        }
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


    fetchData();
  }, []);


  return (
    <div className='ADcontainer-dashboard'>
      <div className='Acontainer'>

        <div className='store-info'>
          <h2>Store ID: <span>{storeID}</span></h2>
          <h2>Store City: <span>{storeCity}</span> </h2>
        </div>
        <div className='widgets-row'>
          <div className='widget available-drivers'>
            <p>{totalDrivers > 0 ? `${Math.floor((activeDrivers / totalDrivers) * 100)}%` : 'Loading...'}</p>
            <div className='progress-bar' style={{ width: '100%'}}>
              <div className='progress' style={{ width: `${Math.floor((activeDrivers / totalDrivers) * 100)}%` }}></div>
            </div>
            <h3>Available Drivers</h3>
          </div>
          <div className='widget available-assistants'>
          <p>{totalTrucks > 0 ? `${Math.floor((activeTrucks / totalTrucks) * 100)}%` : 'Loading...'}</p>
            <div className='progress-bar'>
              <div className='progress' style={{ width: `${Math.floor((activeAssistants / totalAssistants) * 100)}%` }}></div>
            </div>
            <h3>Available Assistants</h3>
          </div>
          <div className='widget available-trucks'>
            <p>{totalAssistants > 0 ? `${Math.floor((activeAssistants / totalAssistants) * 100)}%` : 'Loading...'}</p>
            <div className='progress-bar'>
              <div className='progress' style={{ width: `${Math.floor((activeAssistants / totalAssistants) * 100)}%` }}></div>
            </div>
            <h3>Available Trucks</h3>
          </div>
        </div>
        <div className='calender-order-container'>
          <div className='calendar-container'>
            <Calendar onChange={setDate} value={date} />
          </div>
          <div className='incomplete-order-container'>
              <div className='incomplete-orders'>
              <p>{totalOrders > 0 ? `${Math.floor((incompleteOrders / totalOrders) * 100)}%` : 'Loading...'}</p>
                <div className='progress-bar'>
                  <div className='progress' style={{ width: `${Math.floor((incompleteOrders / totalOrders) * 100)}%` }}></div>
                </div>
                <h3>Incomplete Orders</h3>
            </div>
            <div className='incomplete-orders-table'>
              <table className='orders-table'>
                <thead>
                  <tr>
                    <th className='table-header'>Order ID</th>
                    <th className='table-header'>Customer ID</th>
                    <th className='table-header'>Route ID</th>
                    <th className='table-header'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incompleteOrdersList.map(order => (
                    <tr className='table-row' key={order.id}>
                      <td className='table-data'>{order.id}</td>
                      <td className='table-data'>{order.customer}</td>
                      <td className='table-data'>{order.routeId}</td>
                      <td className='table-data'>{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


          </div>
          
        </div>     

      </div>
    </div>
  );
}

export default Admindashboard;
