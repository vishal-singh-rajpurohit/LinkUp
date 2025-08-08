import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { enterApp, type initialRespType } from '../../app/functions/auth';
import axios from 'axios';
const api = import.meta.env.VITE_API

interface LoginData {
  searchTag: string;
  password: string;
}

const LoginForm = () => {
  const disp = useAppDispatch();
  const router = useNavigate();
  const [formData, setFormData] = useState<LoginData>({
    searchTag: '',
    password: '',
  }); 

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.searchTag || !formData.password) {
      setError("Both fields are required");
      return;
    }

    try {
      interface RegisterResponse {
        data: {
          User: initialRespType
        };
      }
      const resp = await axios.post<RegisterResponse>(`${api}/user/login`,
        { ...formData },
        { withCredentials: true }
      );
      console.log(`resp for Login is: ${JSON.stringify(resp, null, 2)}`);


      disp(enterApp({ userData: resp.data.data.User }))

      router('/')

    } catch (error) {
      console.log(`error in login: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-white mb-2">Login</h2>
        <p className="text-xl font-semibold text-white mb-6">Welcome Again To App</p>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="block text-slate-300 mb-1" htmlFor="searchTag">
            Search Tag or Email
          </label>
          <input
            type="text"
            id="searchTag"
            name="searchTag"
            value={formData.searchTag}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-slate-300 mb-1" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold cursor-pointer py-2 px-4 rounded transition"
        >
          Log In
        </button>
        <div className="mt-4">
          <div className="text-sm">Create Account? <NavLink to={'/register'}><span className="text-green-300 cursor-pointer underline">Sign Up</span></NavLink></div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
