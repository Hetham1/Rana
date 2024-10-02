import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { BASE_URL } from '../hooks/apiconfig';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        username,
        password,
      });

      if (response.data.token) {
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('workPlace', response.data.workPlace);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('fullName', response.data.fullName);

        onLogin();
        navigate('/'); 
      } else {
        setError('.نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err) {
      setError('.ورود ناموفق بود. دوباره تلاش کنید');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">ورود</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">نام کاربری</label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 border rounded-md bg-sec"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">رمز عبور</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border rounded-md bg-sec"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            ورود
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
