import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UploadItem from './pages/UploadItem';
import MyItems from './pages/MyItems';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navigation />
          <div className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={<Home />} />

              <Route element={<PrivateRoute />}>
                <Route path="/upload" element={<UploadItem />} />
                <Route path="/my-items" element={<MyItems />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
          <ToastContainer position="bottom-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
