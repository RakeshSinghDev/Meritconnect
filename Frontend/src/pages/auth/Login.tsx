import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import { errorMessage } from "../../utils/errorMessage";
import Logo from "../../components/common/Logo/Logo";

const Login = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true); setError("");
            const user = await loginUser(form.email, form.password);
            navigate(user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/jobs", { replace: true });
        } catch (err: unknown) {
            setError(errorMessage(err, "Invalid email or password."));
        } finally { setLoading(false); }
    };

    return <main className="min-h-screen bg-[#fafaf9] p-3 sm:p-5">
        <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1560px] overflow-hidden rounded-[28px] border border-neutral-200 bg-white lg:grid-cols-[1.1fr_.9fr] sm:min-h-[calc(100vh-2.5rem)]">
            <aside className="relative hidden overflow-hidden bg-neutral-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,.12),transparent_30%)]" />
                <Link to="/" className="relative inline-flex w-fit items-center gap-3 text-lg font-bold tracking-tight"><img src="/logo.svg" alt="MeritConnect" className="h-8 w-8 rounded-lg shadow-xs" /> MeritConnect</Link>
                <div className="relative my-auto max-w-xl pt-20">
                    <p className="text-sm font-medium text-neutral-400">RECRUITMENT INTELLIGENCE</p>
                    <h1 className="mt-5 text-5xl font-semibold tracking-[-.055em] xl:text-6xl">Make every hire a more confident decision.</h1>
                    <p className="mt-6 max-w-md text-lg leading-8 text-neutral-400">One calm, focused workspace for teams who want to move from signal to shortlist without the busywork.</p>
                    <div className="mt-12 border-t border-white/10 pt-10">

                        <div className="grid grid-cols-2 gap-5">

                            <div>
                                <p className="text-sm text-neutral-500">
                                    AI Resume Analysis
                                </p>

                                <p className="mt-2 text-lg font-medium text-white">
                                    Instant ATS scoring
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-neutral-500">
                                    Smart Matching
                                </p>

                                <p className="mt-2 text-lg font-medium text-white">
                                    Find top candidates
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-neutral-500">
                                    AI Interviews
                                </p>

                                <p className="mt-2 text-lg font-medium text-white">
                                    Automated screening
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-neutral-500">
                                    Hiring Insights
                                </p>

                                <p className="mt-2 text-lg font-medium text-white">
                                    Better decisions
                                </p>
                            </div>

                        </div>

                    </div>
                </div>
                <div className="relative flex items-end justify-between border-t border-white/10 pt-7 text-sm text-neutral-400"><div className="flex gap-6 font-medium text-neutral-300">
                    <span>Google</span>
                    <span>Microsoft</span>
                    <span>OpenAI</span>
                    <span>Stripe</span>
                </div></div>
            </aside>
            <section className="flex items-center justify-center px-5 py-10 sm:p-10 lg:p-16">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="w-full max-w-md">
                    <div className="mb-14 lg:hidden"><Logo /></div>
                    <p className="text-sm font-medium text-neutral-500">WELCOME BACK</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-neutral-950">Sign in to MeritConnect</h2><p className="mt-3 text-neutral-500">Continue building a better hiring process.</p>
                    <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
                        <label className="block"><span className="mb-2 block text-sm font-medium text-neutral-800">Work email</span><input type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-3.5 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10" required /></label>
                        <label className="block"><span className="mb-2 block text-sm font-medium text-neutral-800">Password</span><span className="relative block"><input type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" value={form.password} onChange={handleChange} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-3.5 pr-12 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-neutral-500 hover:text-neutral-950 focus:outline-none">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
                        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .99 }} type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded-xl bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><LoaderCircle className="mr-2 size-4 animate-spin" />Signing in...</> : <>Sign in <ArrowRight className="ml-2 size-4" /></>}</motion.button>
                    </form>
                    <p className="mt-7 text-center text-sm text-neutral-500">New to MeritConnect? <Link to="/register" className="font-semibold text-neutral-950 underline-offset-4 hover:underline">Create an account</Link></p>
                    <p className="mt-10 flex items-center justify-center gap-2 text-xs text-neutral-500"><ShieldCheck size={15} /> Secure, role-based access for every team.</p>
                </motion.div>
            </section>
        </div>
    </main>;
};

export default Login;
