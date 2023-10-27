import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        email: email,
        password: password
      }
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
console.log(response.status)
      if (response.status === 200) {
        window.location = "/DashBoard";
      } else {
        setErrorMessage("Email and password are incorrect. Please try again.");
      }
    } catch (error) {
      console.error(error);
      // Handle other errors here
    }
  };

  return (
    <div className="homepage-container">
      <header className="header">
        <h1>Welcome to ChatNext</h1>
      </header>

      <main className="main-content">
        <section className="login-section">
          <h2>Log In</h2>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
            <button type="submit">Log In</button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
