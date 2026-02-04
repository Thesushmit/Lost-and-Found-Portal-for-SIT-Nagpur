import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navigation from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UploadItem from './pages/UploadItem';
import MyItems from './pages/MyItems';
import ItemDetail from './pages/ItemDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ScrollToTop />
          <div className="d-flex flex-column min-vh-100">
            <Navigation />
            <div className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/home" element={<Home />} />
                <Route path="/items/:id" element={<ItemDetail />} />
                <Route path="/help" element={<HelpCenter />} />

                <Route element={<PrivateRoute />}>
                  <Route path="/upload" element={<UploadItem />} />
                  <Route path="/my-items" element={<MyItems />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </div>
            <ToastContainer 
              position="bottom-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
