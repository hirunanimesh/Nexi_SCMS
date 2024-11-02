import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './UsedHoursOfTrucks.css';

function UsedHoursOfTrucks() {
    const [truckHours, setTruckHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTruckHours = async () => {
            try {
                const response = await axios.get('/manager/truckHours', {
                    withCredentials: true
                });

                setTruckHours(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching truck hours:', error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    navigate('/');
                } else {
                    setError('Error fetching data. Please try again later.');
                }
                setLoading(false);
            }
        };

        fetchTruckHours();
    }, [navigate]);

    // Function to download table as PDF
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Truck Usage Hours", 20, 10);

        doc.autoTable({
            startY: 20,
            head: [['Week Number', 'Truck ID', 'Registration Number', 'Hours Worked']],
            body: truckHours.map(entry => [
                entry.Week_number,
                entry.Truck_id,
                entry.Reg_Number,
                entry.Hours_worked
            ]),
        });

        doc.save("Truck_Usage_Hours_Report.pdf");
    };

    return (
        <div className="used-hours-of-trucks-container">
            <div className="content">
                <div className="table-container">
                    <h2>Truck Usage Hours</h2>
                    
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
                                    <th>Truck ID</th>
                                    <th>Registration Number</th>
                                    <th>Hours Worked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {truckHours.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{entry.Week_number}</td>
                                        <td>{entry.Truck_id}</td>
                                        <td>{entry.Reg_Number}</td>
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

export default UsedHoursOfTrucks;
