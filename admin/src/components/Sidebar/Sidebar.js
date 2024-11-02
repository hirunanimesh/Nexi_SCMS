// Sidebar.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaListUl, FaUserFriends, FaClipboardList, FaChartLine, FaTruck } from 'react-icons/fa';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    



    // Define an async function to fetch admin details
    const fetchAdminData = async () => {
        try {
            const res = await axios.get("/manager/admindetails", { withCredentials: true });

            if (res.data.role === "Admin") {
                setIsAdmin(true);
               
            }
            setName(res.data.result.Name); 
           
            setEmail(res.data.result.Email);
          } catch (error) {
            console.error("Error getting manager details:", error);
          }
    };

        useEffect(() => {
          fetchAdminData();
        }, []); 

    const menuItems = [
        { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/admindashboard' },
        { name: 'Order List', icon: <FaListUl />, path: '/order' },
        { name: 'Driver', icon: <FaUserFriends />, path: '/driver' },
        { name: 'Assistant', icon: <FaClipboardList />, path: '/assistant' },
        { name: 'Report', icon: <FaChartLine />, path: '/report' },
        { name: 'Delivery Schedule', icon: <FaTruck />, path: '/delivery_schedule' },
        { name: 'Manager Control', icon: <FaUserFriends />, path: '/admin-control' }, 
    ];

    return (
        <div className="sidebar">
            <ul className="menu">
                {menuItems.map(item => (
                    (item.name !== 'Manager Control' || isAdmin) && (
                        <li key={item.name}>
                            <Link to={item.path} className="menu-item">
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    )
                ))}
            </ul>

            <div className="admin-info">
                <hr />
                <h2>{name}</h2> 
                <p>{email}</p>
            </div>
        </div>
    );
};

export default Sidebar;
