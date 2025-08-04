import React, { useState } from 'react';
import axios from 'axios';
import { useAppDispatch } from '../../app/hooks';
import { enterApp, type initialRespType } from '../../app/functions/auth'
import { useNavigate } from 'react-router-dom';

const api = import.meta.env.VITE_API

interface FormData {
    userName: string;
    searchTag: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Signup = () => {
    const disp = useAppDispatch();
    const router = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        userName: '',
        searchTag: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setErrors(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setErrors("Passwords do not match");
            return;
        }

        try {
            interface RegisterResponse {
                data: {
                    User: initialRespType
                };
            }
            const resp = await axios.post<RegisterResponse>(`${api}/user/register`,
                { ...formData },
                { withCredentials: true }
            );
            console.log(`resp: ${JSON.stringify(resp, null, 2)}`);
            disp(enterApp({ userData: resp.data.data.User }))

            router('/')

        } catch (error) {
            console.log(`error in register: ${error}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-slate-800 p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-semibold text-white mb-1">Sign Up</h2>
                <p className="text-xl font-semibold text-white mb-6">Welcome to app</p>

                {errors && <div className="text-red-400 mb-4">{errors}</div>}

                <div className="mb-4">
                    <label className="block text-slate-300 mb-1" htmlFor="userName">Username</label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-slate-300 mb-1" htmlFor="searchTag">Search Tag</label>
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

                <div className="mb-4">
                    <label className="block text-slate-300 mb-1" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-slate-300 mb-1" htmlFor="password">Password</label>
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

                <div className="mb-6">
                    <label className="block text-slate-300 mb-1" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded transition"
                >
                    Create Account
                </button>
            </form>
        </div>
    );
};

export default Signup;
