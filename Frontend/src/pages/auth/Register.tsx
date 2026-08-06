import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, Sparkles } from "lucide-react";
import { register } from "../../services/auth.service";
import { errorMessage } from "../../utils/errorMessage";
import Logo from "../../components/common/Logo/Logo";

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "candidate" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true); setError("");
            await register({ name: form.name, email: form.email, password: form.password, role: form.role as "candidate" | "recruiter" });
            navigate("/login");
        } catch (err: unknown) { setError(errorMessage(err, "Registration failed.")); }
        finally { setLoading(false); }
    };

    return <main className="min-h-screen bg-[#fafaf9] p-3 sm:p-5">
        <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1560px] overflow-hidden rounded-[28px] border border-neutral-200 bg-white lg:grid-cols-[1.1fr_.9fr] sm:min-h-[calc(100vh-2.5rem)]">
            <aside className="relative hidden overflow-hidden bg-neutral-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,.12),transparent_30%)]" />
                <Link to="/" className="relative inline-flex w-fit items-center gap-2 text-lg font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-white text-sm text-neutral-950">M</span> MeritConnect</Link>
                <div className="relative my-auto max-w-xl pt-16"><p className="flex items-center gap-2 text-sm font-medium text-neutral-400"><Sparkles size={15} /> BUILT FOR MODERN HIRING</p><h1 className="mt-5 text-5xl font-semibold tracking-[-.055em] xl:text-6xl">A clearer way to find your next great hire.</h1><p className="mt-6 max-w-md text-lg leading-8 text-neutral-400">Bring resumes, interviews, and decisions into a single hiring system designed to keep teams aligned.</p><div className="mt-12 space-y-4">{["Understand fit beyond keywords", "Keep every stakeholder in sync", "Move candidates forward with confidence"].map((item) => <div key={item} className="flex items-center gap-3 text-sm text-neutral-300"><span className="flex size-6 items-center justify-center rounded-full bg-white/10"><Check size={14} /></span>{item}</div>)}</div></div>
                <blockquote className="relative border-t border-white/10 pt-7"><p className="max-w-md text-sm leading-6 text-neutral-300">“MeritConnect makes the work of hiring feel focused, not fragmented.”</p><footer className="mt-3 text-xs text-neutral-500">People Operations Lead · Northstar</footer></blockquote>
            </aside>
            <section className="flex items-center justify-center px-5 py-10 sm:p-10 lg:p-16"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="w-full max-w-md"><div className="mb-12 lg:hidden"><Logo /></div><p className="text-sm font-medium text-neutral-500">GET STARTED</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-neutral-950">Create your account</h1><p className="mt-3 text-neutral-500">Start with a workspace built for thoughtful hiring.</p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
                    <label className="block"><span className="mb-2 block text-sm font-medium text-neutral-800">Full name</span><input type="text" name="name" autoComplete="name" value={form.name} onChange={handleChange} placeholder="Your name" className="h-11 w-full rounded-xl border border-neutral-300 px-3.5 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10" required /></label>
                    <label className="block"><span className="mb-2 block text-sm font-medium text-neutral-800">Work email</span><input type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className="h-11 w-full rounded-xl border border-neutral-300 px-3.5 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10" required /></label>
                    <label className="block"><span className="mb-2 block text-sm font-medium text-neutral-800">Password</span><span className="relative block"><input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="Create a password" className="h-11 w-full rounded-xl border border-neutral-300 px-3.5 pr-12 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-neutral-500 hover:text-neutral-950">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
                    <label className="block"><span className="mb-2 block text-sm font-medium text-neutral-800">I’m joining as</span><select name="role" value={form.role} onChange={handleChange} className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3.5 text-neutral-900 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10"><option value="candidate">Candidate</option><option value="recruiter">Recruiter</option></select></label>
                    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .99 }} type="submit" disabled={loading} className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><LoaderCircle className="mr-2 size-4 animate-spin" />Creating account...</> : <>Create account <ArrowRight className="ml-2 size-4" /></>}</motion.button>
                </form><p className="mt-6 text-center text-sm text-neutral-500">Already have an account? <Link to="/login" className="font-semibold text-neutral-950 underline-offset-4 hover:underline">Sign in</Link></p></motion.div></section>
        </div>
    </main>;
};

export default Register;
