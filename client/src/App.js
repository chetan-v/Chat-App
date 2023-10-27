import React, { Fragment } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import DashBoard from './dashboard/DashBoard';
import HomePage from './components/HomePage';

function App() {
  return (
    <Router>
      <Fragment>
        <div className='container'>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/DashBoard" element={<DashBoard />} />
          </Routes>
        </div>
      </Fragment>
    </Router>
  );
}

export default App;
