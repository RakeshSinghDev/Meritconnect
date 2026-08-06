import Navbar from "../components/layout/Navbar";
import Hero from "../components/sections/Hero";
import Companies from "../components/sections/Companies";
import Features from "../components/sections/Features";
import Workflow from "../components/sections/Workflow";
import DashboardPreview from "../components/sections/DashboardPreview";
import Technology from "../components/sections/Technology";
import Security from "../components/sections/Security";
import FAQ from "../components/sections/FAQ";
import CTA from "../components/sections/CTA";
import Footer from "../components/sections/Footer";

export default function HomePage() {
    return (
        <>
            <Navbar />
            <Hero />
            <Companies />
            <Features />
            <Workflow />
            <DashboardPreview />
            <Technology />
            <Security />
            <FAQ />
            <CTA />
            <Footer />
        </>
    );
}