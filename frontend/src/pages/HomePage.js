// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // HomePage.css file ko import kiya hai

function HomePage() {
    return (
        <div className="home-page-container">
            {/* Simple animated circles - ab classNames use kar rahe hain */}
            <div className="animated-circle-1"></div>
            <div className="animated-circle-2"></div>

            <h1>
                Digital Splitter Banking System
            </h1>
            <p>
                Welcome to your smart financial management solution.
            </p>
            <div style={{ marginTop: '20px' }}>
                <Link to="/login" className="get-started-button">
                    Get Started
                </Link>
            </div>
            {/* Keyframes ab CSS file mein hain, yahan se hata diye gaye hain */}
        </div>
    );
}

export default HomePage;