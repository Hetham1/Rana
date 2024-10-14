import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ isAuthenticated, children }: { isAuthenticated: boolean; children: JSX.Element }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Navigate to login if no token is found in localStorage
      navigate('/login');
    }

    // Set up axios interceptor to handle token expiration globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token is invalid or expired, log out and redirect to login
          localStorage.clear();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Eject the interceptor when the component is unmounted
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // If not authenticated, redirect to login immediately
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render protected content
  return children;
};

export default ProtectedRoute;
