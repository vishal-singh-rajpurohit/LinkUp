import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { firstEnter, type initialRespType } from '../../app/functions/auth'
import { FaComments } from 'react-icons/fa';

const api = import.meta.env.VITE_API;
const passValidator = new RegExp("^[a-zA-Z0-9!@#$%^&*_=+-]{8,12}$");
const searchTagRegEx = new RegExp("^[A-Za-z0-9_]{3,20}$")

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
                message: 'Search tag must be minimum 3 characters',
                type: 'tag'
            })
            return;
        }

        if (!searchTagRegEx.test(formData.searchTag)) {
            setErrors({
                message: "Search tag can only contain letters, numbers, and underscores (_)",
                type: "tag"
            })
            return;
        }

        if (!passValidator.test(formData.password) || !passValidator.test(formData.confirmPassword)) {
            setErrors({
                message: "Password must contain uppercase, lowercase, number, special character and 8-12 characters",
                type: "pass"
            })
            return
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
            window.location.reload()

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
                    message: "Search tag already taken",
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
                    message: "This email is already in use",
                    type: "email"
                })
            }
        }

        if (formData.searchTag.length > 3) {
            checkSearchTag()
        }

        if (formData.email.length > 3 && pass) {
            checkEmail()
        }

    }, [formData, pass])

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
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--c-app-bg)] py-8">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 accent-bg opacity-10 rounded-full blur-3xl pointer-events-none"></div>

            <form
                onSubmit={handleSubmit}
                className="glass-panel p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/15 relative z-10 space-y-4"
            >
                <div className="flex flex-col items-center text-center space-y-1.5">
                    <div className="p-3 rounded-2xl accent-bg text-black shadow-lg">
                        <FaComments size={26} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-[var(--c-text-primary)]">Create Account</h2>
                    <p className="text-xs text-[var(--c-text-muted)]">Join LinkUp for secure real-time messaging</p>
                </div>

                {errors?.message && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-200 text-center font-medium">
                        {errors.message}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--c-text-muted)]" htmlFor="userName">Full Name</label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full h-10 px-3.5 rounded-xl glass-card text-sm text-[var(--c-text-primary)] outline-none border border-white/10 focus:border-[var(--c-accent)] transition placeholder:text-[var(--c-text-muted)]"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--c-text-muted)]" htmlFor="searchTag">Search Tag</label>
                    <input
                        type="text"
                        id="searchTag"
                        name="searchTag"
                        value={formData.searchTag}
                        onChange={handleChange}
                        required
                        placeholder="john_doe"
                        className="w-full h-10 px-3.5 rounded-xl glass-card text-sm text-[var(--c-text-primary)] outline-none border border-white/10 focus:border-[var(--c-accent)] transition placeholder:text-[var(--c-text-muted)]"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--c-text-muted)]" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="w-full h-10 px-3.5 rounded-xl glass-card text-sm text-[var(--c-text-primary)] outline-none border border-white/10 focus:border-[var(--c-accent)] transition placeholder:text-[var(--c-text-muted)]"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--c-text-muted)]" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="w-full h-10 px-3.5 rounded-xl glass-card text-sm text-[var(--c-text-primary)] outline-none border border-white/10 focus:border-[var(--c-accent)] transition placeholder:text-[var(--c-text-muted)]"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--c-text-muted)]" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="w-full h-10 px-3.5 rounded-xl glass-card text-sm text-[var(--c-text-primary)] outline-none border border-white/10 focus:border-[var(--c-accent)] transition placeholder:text-[var(--c-text-muted)]"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full h-11 accent-bg text-black font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition cursor-pointer mt-2"
                >
                    Create Account
                </button>

                <div className="text-center text-xs text-[var(--c-text-muted)] pt-2 border-t border-white/10">
                    Already have an account?{' '}
                    <NavLink to={'/login'} className="accent-text font-bold hover:underline">
                        Log In
                    </NavLink>
                </div>
            </form>
        </div>
    );
};

export default Signup;
