import { Landmark, CheckCircle, Calendar, ArrowRight } from "lucide-react";
import Container from "../../common/Container";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../../store/AuthContext";

const features = [
    {
        icon: <Landmark size={24} className="text-blue-500" />,
        title: "Official notifications",
        description: "Get verified updates on Central Government exams and recruitment drives.",
    },
    {
        icon: <CheckCircle size={24} className="text-green-500" />,
        title: "Eligibility matching",
        description: "See only the opportunities you qualify for based on your profile.",
    },
    {
        icon: <Calendar size={24} className="text-orange-500" />,
        title: "Application deadlines",
        description: "Track important dates so you never miss a submission window.",
    },
];

export default function GovernmentCareers() {
    const { user } = useAuth();
    const isAuthenticated = !!user;
    
    // Determine where the CTA should go
    const ctaLink = isAuthenticated && user?.role === "candidate" 
        ? "/candidate/government-opportunities" 
        : "/register";

    return (
        <section id="government-careers" className="py-28 md:py-36 bg-gray-50/50">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                        Government Careers
                    </p>

                    <h2 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
                        Never miss the next government opportunity.
                    </h2>

                    <p className="mt-6 text-lg text-gray-600">
                        MeritConnect tracks verified Central Government exams and recruitment notifications and helps you discover opportunities that match your profile.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100"
                        >
                            <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
                
                <div className="mt-16 flex justify-center">
                    <Link
                        to={ctaLink}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                    >
                        Explore Government Opportunities
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </Container>
        </section>
    );
}
