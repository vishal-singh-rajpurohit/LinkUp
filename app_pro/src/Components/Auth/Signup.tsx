import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppDispatch } from '../../app/hooks';
import { firstEnter, type initialRespType } from '../../app/functions/auth'
import { useNavigate } from 'react-router-dom';

const api = import.meta.env.VITE_API

interface FormData {
    userName: string;
    searchTag: string;
    email: string;
    password: string;
    confirmPassword: string;
    latitude: string;
    longitude: string;
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
        latitude: '',
        longitude: '',
    });

    const [errors, setErrors] = useState<{
        type: string;
        message: string;
    } | null>(null);

    const [pass, setPass] = useState<boolean>(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setErrors(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.searchTag.length < 3) {
            setErrors({
                message: 'search tag must be min 3 Characters',
                type: 'tag'
            })
        }

        if (formData.password !== formData.confirmPassword) {
            setErrors({
                message: "Passwords do not match",
                type: 'pass'
            });
            return;
        }

        try {
            interface RegisterResponse {
                data: {
                    User: initialRespType;
                    accessToken: string;
                };
            }
            const resp = await axios.post<RegisterResponse>(`${api}/user/register`,
                { ...formData },
                { 
                    withCredentials: true,
                 }
            );
            
            disp(firstEnter({ userData: resp.data.data.User }))
            window.localStorage.setItem("accessToken", resp.data.data.accessToken)
            router('/')

        } catch (error) {
            console.log(`error in register: ${error}`);
        }
    };

    useEffect(() => {
        async function checkSearchTag() {
            try {
                await axios.post(`${api}/user/live-check-searchtag`, {
                    searchTag: formData.searchTag
                }, { withCredentials: true })

                setErrors({
                    message: '',
                    type: ''
                })
                setPass(true)

            } catch (error) {
                setErrors({
                    message: "Search tag Alredy taken",
                    type: "tag"
                })
                setPass(false)
            }
        }

        async function checkEmail() {
            try {
                await axios.post(`${api}/user/live-check-mail`, {
                    email: formData.email
                }, { withCredentials: true })
                setErrors({
                    message: '',
                    type: ''
                })
            } catch (error) {
                setErrors({
                    message: "this email alredy used",
                    type: "email"
                })
            }
        }

        if (formData.searchTag.length > 3) {
            checkSearchTag()
        }

        if (formData.email.length > 3 && pass) [
            checkEmail()
        ]

    }, [formData, setFormData])

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
    }, [])

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-slate-800 p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-semibold text-white mb-1">Sign Up</h2>
                <p className="text-xl font-semibold text-white mb-6">Welcome to app</p>

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
                {errors?.type === 'tag' && <div className="text-red-400 mb-4">{errors.message}</div>}

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
                {errors?.type === 'email' && <div className="text-red-400 mb-4">{errors.message}</div>}

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
