import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    // Function to download table as PDF
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Assistant Work Hours", 20, 10);

        doc.autoTable({
            startY: 20,
            head: [['Week Number', 'Assistant ID', 'Assistant Name', 'Hours Worked']],
            body: assistantWorkHours.map(entry => [
                entry.Week_number,
                entry.Assistant_ID,
                entry.Assistant_Name,
                entry.Hours_worked
            ]),
        });

        doc.save("Assistant_Work_Hours_Report.pdf");
    };

    return (
        <div className="assistant-work-hours-container">
            <div className="content">
                <div className="table-container">
                    <h2>Assistant Work Hours</h2>
                    
                    <button onClick={downloadPDF} className="download-btn">Download PDF</button>

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
                                        <td>{entry.Hours_worked}</td>
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
