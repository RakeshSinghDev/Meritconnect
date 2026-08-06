import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { errorMessage } from "../utils/errorMessage";

const Login = () => {
    const navigate = useNavigate();

    const { loginUser } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const loggedInUser = await loginUser(
                form.email,
                form.password
            );

            // Redirect based on role
            if (loggedInUser.role === "recruiter") {
                navigate("/recruiter/dashboard");
            } else {
                navigate("/candidate/jobs");
            }

        } catch (err: unknown) {
            console.error(err);

            setError(
                errorMessage(err, "Invalid email or password.")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

                <h1 className="mb-2 text-3xl font-bold">
                    Welcome Back
                </h1>

                <p className="mb-8 text-gray-500">
                    Sign in to your account
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                        required
                    />

                    {error && (
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-black py-3 text-white transition hover:bg-gray-900 disabled:opacity-60"
                    >
                        {loading
                            ? "Signing In..."
                            : "Sign In"}
                    </button>

                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-black"
                    >
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
};

export default Login;
