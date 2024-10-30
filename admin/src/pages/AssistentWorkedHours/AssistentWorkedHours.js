import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './AssistantWorkedHours.css';

function AssistantWorkedHours() {
    const [assistantWorkHours, setAssistantWorkHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch the assistant work hours data when the component mounts
    useEffect(() => {
        const fetchAssistantWorkHours = async () => {
            try {
                const response = await axios.get('/manager/assistantWorkHours', {
                    withCredentials: true // Send request with credentials (cookies with token)
                });

                setAssistantWorkHours(response.data); // Set the fetched assistant work hours data
                setLoading(false);
            } catch (error) {
                console.error('Error fetching assistant work hours:', error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    navigate('/'); // Redirect to login if unauthorized
                } else {
                    setError('Error fetching data. Please try again later.');
                }
                setLoading(false);
            }
        };

        fetchAssistantWorkHours();
    }, [navigate]);

    return (
        <div className="assistant-work-hours-container">
            <div className="content">
                <div className="table-container">
                    <h2>Assistant Work Hours</h2>

                    {loading ? (
                        <p>Loading data...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Week Number</th>
                                    <th>Assistant ID</th>
                                    <th>Assistant Name</th>
                                    <th>Hours Worked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assistantWorkHours.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{entry.Week_number}</td>
                                        <td>{entry.Assistant_ID}</td>
                                        <td>{entry.Assistant_Name}</td>
                                        <td>{entry.Work_Hours}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AssistantWorkedHours;
