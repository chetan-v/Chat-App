import React from 'react';
import './DashBoard.css'; // Import your CSS file for styling

const DashBoard = () => {
    return (
        <div className="dashboard">
            <div className="left-block">
                <div className="header">
                    <h1>Chat Application</h1>
                    <button className="logout-button">Logout</button>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>All users</th>
                        </tr>
                    </thead>
                </table>
            </div>
            <div className="chat-section">
                {/* Chat content goes here */}
            </div>
        </div>
    );
};

export default DashBoard;
