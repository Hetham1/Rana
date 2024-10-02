import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ isAuthenticated, children }: { isAuthenticated: boolean; children: JSX.Element }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
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

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
