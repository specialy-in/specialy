import React, { useState, useEffect, useRef, ReactNode } from 'react';
import {
    Home,
    Briefcase,
    Palette,
    HardHat,
    ShoppingBag,
    Check,
    X,
    Star,
    Menu,
    X as CloseIcon,
    ArrowRight,
    FileText,
    Users,
    DollarSign,
    Zap,
    Shield,
    Layout,
    TrendingUp,
    Clock,
    Sun,
    Moon
} from 'lucide-react';
import PlanSelectionModal from './onboarding/PlanSelectionModal';

// --- Types ---
type FadeInProps = {
    children: ReactNode;
    delay?: number;
    className?: string;
};

// --- Components ---

const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            });
        }, { threshold: 0.1 });

        const current = domRef.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

const Button: React.FC<{
    children: ReactNode;
    variant?: 'primary' | 'outline' | 'white-outline' | 'solid-white';
    className?: string;
    onClick?: () => void
}> = ({ children, variant = 'primary', className = '', onClick }) => {
    const baseStyle = "px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-accent text-white hover:bg-blue-700",
        outline: "border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-400",
        "white-outline": "border border-white text-white hover:bg-white hover:text-black",
        "solid-white": "bg-white text-black hover:bg-gray-100"
    };

    return (
        <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
};

const Section: React.FC<{
    id?: string;
    className?: string;
    children: ReactNode
}> = ({ id, className = '', children }) => (
    <section id={id} className={`py-20 px-6 w-full max-w-[1280px] mx-auto ${className}`}>
        {children}
    </section>
);

const LandingPage: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);

    useEffect(() => {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const handleGetStarted = () => {
        setShowPlanModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-primary dark:text-gray-100 font-sans overflow-x-hidden transition-colors duration-300 bg-dot-pattern">
            {/* Background Gradient Overlay */}
            <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-indigo-50/50 via-white/30 to-blue-50/50 dark:from-gray-950/80 dark:via-gray-900/80 dark:to-black/80 z-0"></div>

            {showPlanModal && <PlanSelectionModal onClose={() => setShowPlanModal(false)} />}

            <div className="relative z-10">
                {/* Navigation */}
                <nav className="fixed w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
                    <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary dark:bg-white rounded-br-lg rounded-tl-lg"></div>
                            <span className="text-xl font-serif font-bold tracking-tight text-primary dark:text-white">dimensionloop</span>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <a href="#homeowners" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">For Homeowners</a>
                            <a href="#professionals" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">For Professionals</a>
                            <a href="#pricing" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">Pricing</a>
                            <div className="flex items-center gap-4 ml-4">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="Toggle Dark Mode"
                                >
                                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                                <button className="text-gray-900 dark:text-white font-medium hover:text-accent transition-colors">Login</button>
                                <Button onClick={handleGetStarted}>Get Started</Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 md:hidden">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-primary dark:text-white">
                                {isMenuOpen ? <CloseIcon /> : <Menu />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4 shadow-lg text-primary dark:text-white">
                            <a href="#homeowners" className="text-lg py-2 hover:text-accent" onClick={() => setIsMenuOpen(false)}>For Homeowners</a>
                            <a href="#professionals" className="text-lg py-2 hover:text-accent" onClick={() => setIsMenuOpen(false)}>For Professionals</a>
                            <a href="#pricing" className="text-lg py-2 hover:text-accent" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                            <button className="text-left text-lg py-2 font-medium hover:text-accent">Login</button>
                            <Button className="w-full" onClick={() => { setIsMenuOpen(false); handleGetStarted(); }}>Get Started</Button>
                        </div>
                    )}
                </nav>

                {/* 1. HERO SECTION */}
                <div className="pt-32 pb-12 px-6 max-w-[1280px] mx-auto relative">
                    <FadeIn>
                        <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
                            <h1 className="font-serif text-5xl md:text-[72px] leading-[1.1] mb-6 font-semibold text-primary dark:text-white">
                                The Professional Workspace for Interior Design
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                                Manage clients, get leads, and earn commissions—all in one powerful platform.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto relative z-10">
                        {/* Left Card */}
                        <FadeIn delay={200}>
                            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-10 rounded-2xl h-full flex flex-col items-start border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg shadow-sm mb-6">
                                    <Home className="w-6 h-6 text-accent dark:text-blue-400" />
                                </div>
                                <h3 className="font-serif text-2xl font-semibold mb-3 text-primary dark:text-white">For Homeowners</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-8 flex-grow">
                                    Design your space with real products and hire verified professionals
                                </p>
                                <Button onClick={handleGetStarted}>Start Designing</Button>
                            </div>
                        </FadeIn>

                        {/* Right Card */}
                        <FadeIn delay={400}>
                            <div className="bg-primary/95 dark:bg-black/95 backdrop-blur-sm p-10 rounded-2xl h-full flex flex-col items-start text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent dark:border-gray-800">
                                <div className="bg-white/10 p-3 rounded-lg mb-6 backdrop-blur-sm">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-serif text-2xl font-semibold mb-3">For Professionals</h3>
                                <p className="text-gray-400 mb-8 flex-grow">
                                    Grow your practice with a complete client management workspace
                                </p>
                                <Button variant="white-outline" onClick={handleGetStarted}>View Pricing →</Button>
                            </div>
                        </FadeIn>
                    </div>
                </div>

                {/* TRUST SIGNALS */}
                <div className="py-8 bg-white/50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
                    <div className="max-w-[1280px] mx-auto px-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                        <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Trusted by professionals in 12+ cities</span>
                        <span className="hidden md:block text-gray-300 dark:text-gray-700">|</span>
                        <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Secure payment processing</span>
                        <span className="hidden md:block text-gray-300 dark:text-gray-700">|</span>
                        <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> SOC 2 Compliant</span>
                        <span className="hidden md:block text-gray-300 dark:text-gray-700">|</span>
                        <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> 99.9% Uptime</span>
                    </div>
                </div>

                {/* 2. HOMEOWNERS SECTION */}
                <div className="relative z-10">
                    <Section id="homeowners">
                        <div className="text-center mb-16">
                            <FadeIn>
                                <h2 className="font-serif text-4xl font-bold mb-4 text-primary dark:text-white">Design Your Space, Your Way</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                                    Visualize products in your room, connect with professionals, and bring your vision to life—all for free.
                                </p>
                            </FadeIn>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <FadeIn delay={100}>
                                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                                        <Palette className="w-8 h-8 text-accent dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-semibold mb-3 text-primary dark:text-white">Design Tool</h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Upload your room photo and try <span className="font-semibold text-gray-900 dark:text-white">50+ styles</span> in real-time. See exactly how ₹45,000 worth of furniture looks before buying.
                                    </p>
                                </div>
                            </FadeIn>

                            <FadeIn delay={200}>
                                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                                        <HardHat className="w-8 h-8 text-success dark:text-green-400" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-semibold mb-3 text-primary dark:text-white">Hire Pros</h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Browse <span className="font-semibold text-gray-900 dark:text-white">200+ verified architects</span>. Send proposals to 3 pros and get responses in 24-48 hours.
                                    </p>
                                </div>
                            </FadeIn>

                            <FadeIn delay={300}>
                                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300">
                                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                                        <ShoppingBag className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-semibold mb-3 text-primary dark:text-white">Marketplace</h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Shop <span className="font-semibold text-gray-900 dark:text-white">5,000+ curated products</span> from trusted brands. Visualize each item in YOUR room, not stock photos.
                                    </p>
                                </div>
                            </FadeIn>
                        </div>
                    </Section>
                </div>

                {/* HOW IT WORKS SECTION */}
                <div className="bg-gray-50/80 dark:bg-[#111]/80 backdrop-blur-sm py-20 transition-colors duration-300">
                    <div className="max-w-[1280px] mx-auto px-6">
                        <div className="text-center mb-16">
                            <FadeIn>
                                <h2 className="font-serif text-4xl font-bold mb-4 text-primary dark:text-white">How It Works</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">Three simple steps to your dream space or growing practice.</p>
                            </FadeIn>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                            {/* Homeowners */}
                            <FadeIn delay={100} className="space-y-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                                        <Home className="w-6 h-6 text-primary dark:text-white" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-primary dark:text-white">For Homeowners</h3>
                                </div>
                                <ol className="relative border-l border-gray-200 dark:border-gray-800 ml-4 space-y-12">
                                    <li className="mb-10 ml-8">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full -left-4 ring-4 ring-white dark:ring-[#111]">
                                            <span className="text-accent dark:text-blue-200 font-bold">1</span>
                                        </span>
                                        <h4 className="font-bold text-lg mb-1 text-primary dark:text-white">Upload room photo</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Take a picture of your space and upload it to our AI design tool.</p>
                                    </li>
                                    <li className="mb-10 ml-8">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full -left-4 ring-4 ring-white dark:ring-[#111]">
                                            <span className="text-accent dark:text-blue-200 font-bold">2</span>
                                        </span>
                                        <h4 className="font-bold text-lg mb-1 text-primary dark:text-white">Browse products & visualize</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Try different furniture and styles to see exactly how they fit.</p>
                                    </li>
                                    <li className="ml-8">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full -left-4 ring-4 ring-white dark:ring-[#111]">
                                            <span className="text-accent dark:text-blue-200 font-bold">3</span>
                                        </span>
                                        <h4 className="font-bold text-lg mb-1 text-primary dark:text-white">Send proposal to architects</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Share your visualized room and budget with verified pros to get quotes.</p>
                                    </li>
                                </ol>
                            </FadeIn>

                            {/* Professionals */}
                            <FadeIn delay={300} className="space-y-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-primary dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-primary dark:text-white">For Professionals</h3>
                                </div>
                                <ol className="relative border-l border-gray-200 dark:border-gray-800 ml-4 space-y-12">
                                    <li className="mb-10 ml-8">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-primary dark:bg-gray-700 text-white rounded-full -left-4 ring-4 ring-white dark:ring-[#111]">
                                            <span className="font-bold">1</span>
                                        </span>
                                        <h4 className="font-bold text-lg mb-1 text-primary dark:text-white">Receive high-intent proposals</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Get leads from homeowners who have already defined their style and budget.</p>
                                    </li>
                                    <li className="mb-10 ml-8">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-primary dark:bg-gray-700 text-white rounded-full -left-4 ring-4 ring-white dark:ring-[#111]">
                                            <span className="font-bold">2</span>
                                        </span>
                                        <h4 className="font-bold text-lg mb-1 text-primary dark:text-white">Design in the workspace</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Manage the entire project, client communication, and BOQs in one place.</p>
                                    </li>
                                    <li className="ml-8">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-primary dark:bg-gray-700 text-white rounded-full -left-4 ring-4 ring-white dark:ring-[#111]">
                                            <span className="font-bold">3</span>
                                        </span>
                                        <h4 className="font-bold text-lg mb-1 text-primary dark:text-white">Earn commission on products</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Get 5% commission on every product your client purchases through the platform.</p>
                                    </li>
                                </ol>
                            </FadeIn>
                        </div>
                    </div>
                </div>

                {/* 3. PROFESSIONALS SECTION */}
                <Section id="professionals">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <FadeIn>
                            <h2 className="font-serif text-4xl font-bold mb-6 text-primary dark:text-white">Everything You Need to Run Your Practice</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                                Stop juggling WhatsApp, Excel, and email. Manage everything in one professional workspace.
                            </p>

                            <div className="space-y-6">
                                {[
                                    {
                                        icon: Users,
                                        title: "Client Workspace",
                                        desc: "Manage projects, share proposals, client portal",
                                        stat: "Architects report 60% less client communication time"
                                    },
                                    {
                                        icon: Zap,
                                        title: "Get High-Intent Leads",
                                        desc: "Receive ready-to-hire homeowner proposals",
                                        stat: "Average lead-to-client conversion: 1 in 4"
                                    },
                                    {
                                        icon: DollarSign,
                                        title: "Earn Commission on Every Project",
                                        desc: "Earn 5% commission on all client purchases",
                                        stat: "Top freelancers earn ₹25,000-75,000/month extra",
                                        highlight: true
                                    },
                                    {
                                        icon: FileText,
                                        title: "Auto-Generate BOQ & Proposals",
                                        desc: "Create professional documents in minutes",
                                        stat: "Saves 8-12 hours per project on average"
                                    }
                                ].map((item, index) => (
                                    <div key={index} className="flex gap-4 p-4 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${item.highlight ? 'bg-green-100 dark:bg-green-900/30 text-success dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg mb-1 text-primary dark:text-white">{item.title}</h4>
                                            <p className={`text-sm mb-2 ${item.highlight ? 'text-success dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>{item.desc}</p>
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                                <TrendingUp size={12} /> {item.stat}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>

                        <FadeIn delay={200} className="relative h-full min-h-[600px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner transition-colors duration-300">
                            {/* Abstract representation of a dashboard UI */}
                            <div className="absolute top-10 left-10 right-0 bottom-0 bg-white dark:bg-gray-900 rounded-tl-xl shadow-2xl p-6 border-l border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <div>
                                        <div className="h-5 w-48 bg-gray-900 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-3 w-24 bg-gray-400 dark:bg-gray-600 rounded"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                        <div className="h-8 w-24 bg-accent rounded shadow-sm"></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                                        <div className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-2">Total Earnings</div>
                                        <div className="h-6 w-20 bg-green-100 dark:bg-green-900/40 rounded mb-1"></div>
                                        <div className="h-3 w-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                                        <div className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-2">Active Projects</div>
                                        <div className="h-6 w-10 bg-blue-100 dark:bg-blue-900/40 rounded mb-1"></div>
                                        <div className="h-3 w-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                                        <div className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-2">Pending Leads</div>
                                        <div className="h-6 w-10 bg-purple-100 dark:bg-purple-900/40 rounded mb-1"></div>
                                        <div className="h-3 w-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-gray-400 dark:text-gray-500 font-medium px-2">
                                        <span>Project Name</span>
                                        <span>Status</span>
                                        <span>Due</span>
                                    </div>
                                    <div className="h-16 w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center px-4 justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="w-32 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                        </div>
                                        <div className="w-16 h-6 rounded-full bg-green-100 dark:bg-green-900/30"></div>
                                    </div>
                                    <div className="h-16 w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center px-4 justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                        </div>
                                        <div className="w-16 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30"></div>
                                    </div>
                                    <div className="h-16 w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center px-4 justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="w-28 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                        </div>
                                        <div className="w-16 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30"></div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </Section>

                {/* 4. PRICING SECTION */}
                <Section id="pricing" className="bg-gray-50/80 dark:bg-[#111]/80 backdrop-blur-sm transition-colors duration-300">
                    <div className="text-center mb-12">
                        <FadeIn>
                            <h2 className="font-serif text-4xl font-bold mb-4 text-primary dark:text-white">Simple, Transparent Pricing</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">A single lead pays for your subscription.</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Average project value: ₹3-8 lakhs | Your subscription: ₹999/month</p>
                        </FadeIn>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Free Tier */}
                        <FadeIn delay={100} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Homeowners</h3>
                            <div className="text-sm text-gray-500 font-medium mb-4">Free Forever</div>
                            <div className="text-4xl font-serif font-bold mb-6 text-primary dark:text-white">₹0</div>
                            <ul className="space-y-3 mb-8 flex-grow">
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Upload photos</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Browse marketplace</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Visualize products</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Send proposals</li>
                                <li className="flex gap-2 text-sm text-gray-400 dark:text-gray-600"><X size={16} className="shrink-0" /> No AI renders</li>
                                <li className="flex gap-2 text-sm text-gray-400 dark:text-gray-600"><X size={16} className="shrink-0" /> Max 3 active projects</li>
                            </ul>
                            <Button variant="outline" className="w-full" onClick={handleGetStarted}>Start Free</Button>
                        </FadeIn>

                        {/* Student Tier */}
                        <FadeIn delay={200} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Student/Enthusiast</h3>
                            <div className="text-sm text-gray-500 font-medium mb-4">For starters</div>
                            <div className="text-4xl font-serif font-bold mb-6 text-primary dark:text-white">₹499<span className="text-base font-sans font-normal text-gray-500">/mo</span></div>
                            <ul className="space-y-3 mb-8 flex-grow">
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Portfolio website</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Manage 3 clients</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Basic BOQ</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Client portal</li>
                                <li className="flex gap-2 text-sm text-gray-400 dark:text-gray-600"><X size={16} className="shrink-0" /> No leads</li>
                                <li className="flex gap-2 text-sm text-gray-400 dark:text-gray-600"><X size={16} className="shrink-0" /> No commission</li>
                                <li className="flex gap-2 text-sm text-gray-400 dark:text-gray-600"><X size={16} className="shrink-0" /> Watermarked exports</li>
                            </ul>
                            <Button variant="outline" className="w-full" onClick={handleGetStarted}>Start Free Trial</Button>
                        </FadeIn>

                        {/* Freelancer Tier */}
                        <FadeIn delay={300} className="bg-white dark:bg-gray-900 p-6 rounded-xl border-2 border-accent shadow-lg relative flex flex-col transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">MOST POPULAR</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Freelancer</h3>
                            <div className="text-sm text-gray-500 font-medium mb-4">For growing pros</div>
                            <div className="text-4xl font-serif font-bold mb-6 text-primary dark:text-white">₹999<span className="text-base font-sans font-normal text-gray-500">/mo</span></div>
                            <ul className="space-y-3 mb-8 flex-grow">
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Everything in Student</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Unlimited clients</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Get leads</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> 5% commission</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Auto BOQ</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Analytics</li>
                            </ul>
                            <Button className="w-full" onClick={handleGetStarted}>Start Free Trial</Button>
                        </FadeIn>

                        {/* Studio Tier */}
                        <FadeIn delay={400} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Studio</h3>
                            <div className="text-sm text-gray-500 font-medium mb-4">For teams</div>
                            <div className="text-4xl font-serif font-bold mb-6 text-primary dark:text-white">₹1,999<span className="text-base font-sans font-normal text-gray-500">/mo</span></div>
                            <ul className="space-y-3 mb-8 flex-grow">
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Everything in Freelancer</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Team workspace (3 seats)</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> 5 FREE leads/month</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> White-label portal</li>
                                <li className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check size={16} className="text-success shrink-0" /> Dedicated account manager</li>
                            </ul>
                            <Button variant="outline" className="w-full" onClick={handleGetStarted}>Contact Sales</Button>
                        </FadeIn>
                    </div>

                    <FadeIn delay={500} className="mt-12">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-6 max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6">
                            <div className="bg-green-50 dark:bg-green-900/30 text-success p-3 rounded-full shrink-0">
                                <DollarSign size={32} />
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">ROI Calculator</h4>
                                <p className="text-gray-600 dark:text-gray-400">
                                    If you close just 1 project/month from our leads:
                                    <br />
                                    <span className="font-medium text-gray-900 dark:text-white">Average Commission: ₹30,000</span> - <span className="text-gray-500">Cost: ₹999</span> = <span className="text-success font-bold">Net Gain: ₹29,001/month (2,900% ROI)</span>
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </Section>

                {/* 5. TRANSFORMATION SECTION (Replaces Competitive) */}
                <section className="bg-gradient-to-b from-gray-50/50 to-white/0 dark:from-gray-900/50 dark:to-black/0 py-20 transition-colors duration-300 backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto px-6">
                        <FadeIn>
                            <h2 className="text-4xl md:text-5xl font-serif text-center mb-4 text-primary dark:text-white">
                                Built for Independence, Not Employment
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-16 max-w-2xl mx-auto">
                                The only platform designed to help you own your practice, not work for someone else's.
                            </p>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Before Column */}
                            <FadeIn delay={100} className="space-y-8">
                                <h3 className="text-2xl font-semibold mb-6 text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-4">
                                    The Old Way
                                </h3>

                                <div className="flex gap-4 items-start opacity-60 group hover:opacity-100 transition-opacity">
                                    <span className="text-2xl">❌</span>
                                    <div>
                                        <h4 className="font-semibold text-lg text-primary dark:text-white">WhatsApp Chaos</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Client messages scattered across 15 groups</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start opacity-60 group hover:opacity-100 transition-opacity">
                                    <span className="text-2xl">❌</span>
                                    <div>
                                        <h4 className="font-semibold text-lg text-primary dark:text-white">Manual BOQs</h4>
                                        <p className="text-gray-600 dark:text-gray-400">8-12 hours per project in Excel</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start opacity-60 group hover:opacity-100 transition-opacity">
                                    <span className="text-2xl">❌</span>
                                    <div>
                                        <h4 className="font-semibold text-lg text-primary dark:text-white">Cold Outreach</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Chasing leads with no budget or timeline</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start opacity-60 group hover:opacity-100 transition-opacity">
                                    <span className="text-2xl">❌</span>
                                    <div>
                                        <h4 className="font-semibold text-lg text-primary dark:text-white">Zero Passive Income</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Only get paid for design fees, nothing else</p>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* After Column */}
                            <FadeIn delay={300} className="space-y-8 bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                                <h3 className="text-2xl font-semibold mb-6 text-accent border-b border-blue-100 dark:border-blue-900/20 pb-4">
                                    With dimensionloop
                                </h3>

                                <div className="flex gap-4 items-start">
                                    <div className="bg-white dark:bg-gray-800 p-1 rounded shadow-sm text-success"><Check size={20} /></div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-primary dark:text-white">Professional Workspace</h4>
                                        <p className="text-gray-700 dark:text-gray-300">All clients, projects, and docs in one place</p>
                                        <span className="text-sm text-green-600 dark:text-green-400 font-bold flex items-center gap-1 mt-1">
                                            <TrendingUp size={14} /> Saves 15 hrs/week
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="bg-white dark:bg-gray-800 p-1 rounded shadow-sm text-success"><Check size={20} /></div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-primary dark:text-white">Auto-Generated BOQs</h4>
                                        <p className="text-gray-700 dark:text-gray-300">Professional docs in 5 minutes</p>
                                        <span className="text-sm text-green-600 dark:text-green-400 font-bold flex items-center gap-1 mt-1">
                                            <Clock size={14} /> Saves 8 hrs/project
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="bg-white dark:bg-gray-800 p-1 rounded shadow-sm text-success"><Check size={20} /></div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-primary dark:text-white">High-Intent Leads</h4>
                                        <p className="text-gray-700 dark:text-gray-300">Homeowners with budget and design ready</p>
                                        <span className="text-sm text-green-600 dark:text-green-400 font-bold flex items-center gap-1 mt-1">
                                            <Zap size={14} /> 25% conversion rate
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="bg-white dark:bg-gray-800 p-1 rounded shadow-sm text-success"><Check size={20} /></div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-primary dark:text-white">Earn 5% Commission</h4>
                                        <p className="text-gray-700 dark:text-gray-300">Passive income on every project</p>
                                        <span className="text-sm text-green-600 dark:text-green-400 font-bold flex items-center gap-1 mt-1">
                                            <DollarSign size={14} /> Avg ₹25k-75k/month
                                        </span>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 6. TESTIMONIALS */}
                <Section className="relative z-10 transition-colors duration-300">
                    <div className="text-center mb-16">
                        <FadeIn>
                            <h2 className="font-serif text-4xl font-bold mb-4 text-primary dark:text-white">Trusted by Designers Across India</h2>
                        </FadeIn>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "I've managed 12 clients in 3 months without hiring an assistant. The BOQ tool alone saves me 10 hours/week.",
                                author: "Rahul Verma",
                                role: "Freelance Architect, Delhi",
                                context: "Before: 3 clients | After: 12 clients"
                            },
                            {
                                quote: "The lead quality is incredible—homeowners already have their design and budget ready.",
                                author: "Priya Sharma",
                                role: "Interior Designer, Mumbai",
                                context: "Closing rate: 30%"
                            },
                            {
                                quote: "Earned ₹45,000 in commissions last quarter. This platform pays for itself 10x over.",
                                author: "Kabir Malhotra",
                                role: "Architect, Bangalore",
                                context: "ROI: 1000%+"
                            }
                        ].map((item, idx) => (
                            <FadeIn key={idx} delay={idx * 150} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-100 dark:border-gray-700 relative group hover:shadow-lg transition-all duration-300">
                                <div className="flex gap-1 mb-4 text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-6 italic min-h-[80px]">"{item.quote}"</p>

                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="font-semibold text-gray-900 dark:text-white">{item.author}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.role}</div>
                                    <div className="text-xs font-bold text-accent dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-1 rounded">
                                        {item.context}
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </Section>

                {/* 7. FINAL CTA SECTION */}
                <div className="flex flex-col md:flex-row min-h-[400px]">
                    {/* Left Half - Homeowners */}
                    <div className="w-full md:w-1/2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md flex items-center justify-center p-12 md:p-20 border-r border-white/10 transition-colors duration-300">
                        <FadeIn className="max-w-md">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Ready to Design Your Space?</h3>
                            <div className="space-y-2 mb-6 text-gray-600 dark:text-gray-300 font-medium">
                                <div className="flex items-center gap-2"><Check size={18} className="text-success" /> Free forever</div>
                                <div className="flex items-center gap-2"><Check size={18} className="text-success" /> No credit card required</div>
                                <div className="flex items-center gap-2"><Check size={18} className="text-success" /> 10,000+ rooms designed</div>
                            </div>
                            <Button onClick={handleGetStarted}>Start Designing Now <ArrowRight size={18} /></Button>
                        </FadeIn>
                    </div>

                    {/* Right Half - Professionals */}
                    <div className="w-full md:w-1/2 bg-primary dark:bg-black flex items-center justify-center p-12 md:p-20 transition-colors duration-300">
                        <FadeIn className="max-w-md">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Ready to Grow Your Practice?</h3>
                            <div className="space-y-2 mb-6 text-gray-300 font-medium">
                                <div className="flex items-center gap-2"><Check size={18} className="text-success" /> 14-day free trial</div>
                                <div className="flex items-center gap-2"><Check size={18} className="text-success" /> Cancel anytime</div>
                                <div className="flex items-center gap-2"><Check size={18} className="text-success" /> Setup takes 5 minutes</div>
                            </div>
                            <Button variant="white-outline" onClick={handleGetStarted}>Start Free Trial <ArrowRight size={18} /></Button>
                        </FadeIn>
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 pt-20 pb-10 transition-colors duration-300">
                    <div className="max-w-[1280px] mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
                            <div className="col-span-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 bg-primary dark:bg-white rounded-br-md rounded-tl-md"></div>
                                    <span className="text-lg font-serif font-bold text-primary dark:text-white">dimensionloop</span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    Empowering homeowners and design professionals to build better spaces together.
                                </p>
                                <div className="flex gap-4">
                                    {/* Social icons placeholder */}
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-6">Platform</h4>
                                <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">For Homeowners</a></li>
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">For Professionals</a></li>
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">Pricing</a></li>
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">Enterprise</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-6">Company</h4>
                                <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">About Us</a></li>
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">Careers</a></li>
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">Blog</a></li>
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">Contact</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-6">Legal</h4>
                                <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">Terms of Service</a></li>
                                    <li><a href="#" className="hover:text-primary dark:hover:text-white">Cookie Policy</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-xs text-gray-500 dark:text-gray-500">© 2024 DimensionLoop Inc. All rights reserved.</p>
                            <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-500">
                                <span>Made with ❤️ in Bangalore</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
