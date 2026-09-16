import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { enterApp, type initialRespType } from '../../app/functions/auth';
import axios, { AxiosError } from 'axios';
import { FaComments } from 'react-icons/fa';
const api = import.meta.env.VITE_API

interface LoginData {
  searchTag: string;
  password: string;
  latitude: string;
  longitude: string;
}

const passValidator = new RegExp("^[a-zA-Z0-9!@#$%^&*_=+-]{8,12}$");

const LoginForm = () => {
  const disp = useAppDispatch();
  const router = useNavigate();
  const [formData, setFormData] = useState<LoginData>({
    searchTag: '',
    password: '',
    latitude: '',
    longitude: ''
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

    if (!passValidator.test(formData.password) ) {
      setError("Password must contain one uppercase, lowercase, number, special character and 8 to 12 characters")
      return
    }

    try {
      interface RegisterResponse {
        data: {
          User: initialRespType;
          accessToken: string;
        };
      }
      const resp = await axios.post<RegisterResponse>(`${api}/user/login`,
        { ...formData },
        { withCredentials: true }
      );
      disp(enterApp({ userData: resp.data.data.User }))
      window.localStorage.setItem("accessToken", resp.data.data.accessToken)
      router('/')

    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.status === 401) {
          setError("Invalid search tag or password")
        }
        throw new Error(`Error in login: ${error.status}`)
      }
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude)
        })
      }
    )
    if (!formData.latitude) {
      setFormData({
        ...formData,
        latitude: "Not given",
        longitude: "Not given",
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--c-app-bg)]">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 accent-bg opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <form
        onSubmit={handleSubmit}
        className="glass-panel p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/15 relative z-10 space-y-5"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-2xl accent-bg text-black shadow-lg">
            <FaComments size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--c-text-primary)]">Welcome Back</h2>
          <p className="text-xs text-[var(--c-text-muted)]">Sign in to continue chatting on LinkUp</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200 text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--c-text-muted)]" htmlFor="searchTag">
            Search Tag or Email
          </label>
          <input
            type="text"
            id="searchTag"
            name="searchTag"
            value={formData.searchTag}
            onChange={handleChange}
            required
            placeholder="e.g. john_doe"
            className="w-full h-11 px-3.5 rounded-xl glass-card text-sm text-[var(--c-text-primary)] outline-none border border-white/10 focus:border-[var(--c-accent)] transition placeholder:text-[var(--c-text-muted)]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--c-text-muted)]" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full h-11 px-3.5 rounded-xl glass-card text-sm text-[var(--c-text-primary)] outline-none border border-white/10 focus:border-[var(--c-accent)] transition placeholder:text-[var(--c-text-muted)]"
          />
        </div>

        <button
          type="submit"
          className="w-full h-11 accent-bg text-black font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition cursor-pointer"
        >
          Log In
        </button>

        <div className="text-center text-xs text-[var(--c-text-muted)] pt-2 border-t border-white/10">
          Don't have an account?{' '}
          <NavLink to={'/register'} className="accent-text font-bold hover:underline">
            Create Account
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
