import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ShoppingCart, ChevronDown, X, CheckCircle,
    MapPin, Send, Users
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// --- Types ---
interface Architect {
    id: string;
    name: string;
    photoURL: string;
    email: string;
    city: string;
    specializations: string[];
    yearsExperience: number;
    tagline: string;
    bio: string;
    portfolioImages: string[];
    verified: boolean;
    projectsCompleted?: number;
    avgResponseTime?: string;
    selectedPlan?: 'studio' | 'freelancer' | 'student';
}

interface Project {
    id: string;
    name: string;
}

// --- Mock Data ---
const mockArchitects: Architect[] = [
    {
        id: 'arch-1',
        name: 'Priya Sharma',
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        email: 'priya@example.com',
        city: 'Mumbai',
        specializations: ['Modern', 'Minimalist'],
        yearsExperience: 8,
        tagline: 'Specialist in Modern & Minimalist Residential Spaces',
        bio: 'With over 8 years of experience in residential interior design, I bring a unique blend of contemporary aesthetics and functional living spaces. My approach focuses on clean lines, natural materials, and thoughtful space planning that enhances daily living.\n\nI believe every home should tell a story – your story. Whether you\'re redesigning a single room or your entire home, I work closely with clients to understand their lifestyle, preferences, and aspirations.',
        portfolioImages: [
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
            'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600',
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600',
        ],
        verified: true,
        projectsCompleted: 23,
        avgResponseTime: '< 12 hours',
        selectedPlan: 'studio'
    },
    {
        id: 'arch-2',
        name: 'Arjun Mehta',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        email: 'arjun@example.com',
        city: 'Delhi',
        specializations: ['Industrial', 'Contemporary'],
        yearsExperience: 12,
        tagline: 'Creating Raw, Authentic Industrial Spaces',
        bio: 'I specialize in industrial and contemporary design, transforming spaces with exposed materials, bold textures, and purposeful design elements. My work celebrates authenticity and craftsmanship.\n\nEvery project is an opportunity to create something unique that reflects both the architecture of the space and the personality of its inhabitants.',
        portfolioImages: [
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600',
            'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600',
        ],
        verified: true,
        projectsCompleted: 45,
        avgResponseTime: '< 24 hours',
        selectedPlan: 'studio'
    },
    {
        id: 'arch-3',
        name: 'Sneha Reddy',
        photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
        email: 'sneha@example.com',
        city: 'Bangalore',
        specializations: ['Scandinavian', 'Minimalist'],
        yearsExperience: 5,
        tagline: 'Nordic-Inspired Warmth for Indian Homes',
        bio: 'Bringing the warmth and simplicity of Scandinavian design to Indian homes. I focus on light, functionality, and the beauty of natural materials.\n\nMy designs prioritize comfort and practicality while maintaining a clean, uncluttered aesthetic that promotes well-being.',
        portfolioImages: [
            'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600',
            'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600',
            'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600',
            'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600',
            'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600',
            'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=600',
        ],
        verified: true,
        projectsCompleted: 15,
        avgResponseTime: '< 6 hours',
        selectedPlan: 'freelancer'
    },
    {
        id: 'arch-4',
        name: 'Vikram Patel',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
        email: 'vikram@example.com',
        city: 'Pune',
        specializations: ['Traditional', 'Contemporary'],
        yearsExperience: 15,
        tagline: 'Blending Heritage with Modern Comfort',
        bio: 'With 15 years of experience, I specialize in creating spaces that honor traditional Indian aesthetics while incorporating modern conveniences and sustainability.\n\nMy work celebrates our rich cultural heritage while ensuring homes are practical, comfortable, and suited for contemporary lifestyles.',
        portfolioImages: [
            'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600',
            'https://images.unsplash.com/photo-1600566753104-685f4f24cb4d?w=600',
            'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=600',
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600',
            'https://images.unsplash.com/photo-1600573472591-ee6981cf81e6?w=600',
            'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=600',
        ],
        verified: true,
        projectsCompleted: 67,
        avgResponseTime: '< 24 hours',
        selectedPlan: 'freelancer'
    },
    {
        id: 'arch-5',
        name: 'Ananya Krishnan',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        email: 'ananya@example.com',
        city: 'Chennai',
        specializations: ['Modern', 'Tropical'],
        yearsExperience: 7,
        tagline: 'Tropical Modern Living for Coastal Homes',
        bio: 'Specializing in tropical modern design that embraces natural ventilation, local materials, and indoor-outdoor living perfect for South Indian climates.\n\nI create homes that are cool, comfortable, and connected to nature.',
        portfolioImages: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600',
            'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600',
            'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600',
        ],
        verified: true,
        projectsCompleted: 28,
        avgResponseTime: '< 12 hours',
        selectedPlan: 'freelancer'
    },
    {
        id: 'arch-6',
        name: 'Rahul Deshmukh',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        email: 'rahul@example.com',
        city: 'Hyderabad',
        specializations: ['Contemporary', 'Luxury'],
        yearsExperience: 10,
        tagline: 'Luxury Interiors with Contemporary Flair',
        bio: 'Creating high-end residential interiors that combine luxury with livability. My designs feature premium materials, custom furniture, and meticulous attention to detail.\n\nI believe luxury should be both beautiful and functional.',
        portfolioImages: [
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
            'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600',
            'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
        ],
        verified: true,
        projectsCompleted: 38,
        avgResponseTime: '< 24 hours',
        selectedPlan: 'studio'
    },
    {
        id: 'arch-7',
        name: 'Kavitha Iyer',
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
        email: 'kavitha@example.com',
        city: 'Mumbai',
        specializations: ['Minimalist', 'Japanese'],
        yearsExperience: 6,
        tagline: 'Zen-Inspired Minimalism for Urban Homes',
        bio: 'Bringing the tranquility of Japanese design principles to Mumbai apartments. My work focuses on creating calm, clutter-free spaces that promote mindfulness.\n\nEvery element in my designs has purpose and meaning.',
        portfolioImages: [
            'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600',
            'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600',
            'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600',
            'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=600',
            'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=600',
            'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600',
        ],
        verified: false,
        projectsCompleted: 12,
        avgResponseTime: '< 6 hours',
        selectedPlan: 'student'
    },
    {
        id: 'arch-8',
        name: 'Aditya Nair',
        photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
        email: 'aditya@example.com',
        city: 'Kolkata',
        specializations: ['Traditional', 'Colonial'],
        yearsExperience: 20,
        tagline: 'Preserving Colonial Heritage in Modern Homes',
        bio: 'With two decades of experience, I specialize in restoring and reimagining colonial-era homes while preserving their historical character.\n\nMy work bridges the gap between heritage conservation and contemporary living.',
        portfolioImages: [
            'https://images.unsplash.com/photo-1600566753104-685f4f24cb4d?w=600',
            'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600',
            'https://images.unsplash.com/photo-1600573472591-ee6981cf81e6?w=600',
            'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=600',
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600',
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600',
        ],
        verified: true,
        projectsCompleted: 89,
        avgResponseTime: '< 48 hours',
        selectedPlan: 'studio'
    }
];

const mockProjects: Project[] = [
    { id: 'proj-1', name: 'Living Room Makeover' },
    { id: 'proj-2', name: 'Master Bedroom Redesign' },
    { id: 'proj-3', name: 'Kitchen Renovation' },
];

const cities = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'];
const specializations = ['All Styles', 'Modern', 'Minimalist', 'Traditional', 'Industrial', 'Scandinavian', 'Contemporary', 'Luxury', 'Tropical', 'Japanese', 'Colonial'];
const experienceRanges = ['Any Experience', '0-2 years', '2-5 years', '5-10 years', '10+ years'];
const sortOptions = ['Best Match', 'Most Experienced', 'Newest'];
const budgetRanges = ['Under ₹2L', '₹2L - ₹5L', '₹5L - ₹10L', '₹10L+', 'Flexible'];
const timelines = ['Urgent (< 1 month)', '1-2 months', '3-6 months', '6+ months', 'Flexible'];

// --- Components ---

const FilterDropdown: React.FC<{
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/[0.08] hover:border-white/20 transition-all min-w-[140px] justify-between"
            >
                <span className="truncate max-w-[100px]">{value}</span>
                <ChevronDown size={14} className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 py-1 max-h-60 overflow-y-auto"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => { onChange(option); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === option ? 'text-orange-500 bg-orange-500/10' : 'text-gray-300 hover:bg-white/5'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ArchitectCard: React.FC<{
    architect: Architect;
    onViewPortfolio: () => void;
    onSendProposal: () => void;
}> = ({ architect, onViewPortfolio }) => {
    const isStudio = architect.selectedPlan === 'studio';

    // Generate skill tags from specializations
    const skillTags = architect.specializations.slice(0, 4);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/10 hover:shadow-2xl shadow-xl shadow-black/10 transition-all duration-300"
        >
            {/* Corner Ribbon for Premium/Verified */}
            {(isStudio || architect.verified) && (
                <div className="absolute top-0 right-0 z-10">
                    <div className={`px-3 py-1 text-[9px] font-bold tracking-wider uppercase ${isStudio ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        {isStudio ? 'Premium' : 'Verified'}
                    </div>
                </div>
            )}

            {/* Square Headshot - 200x200 */}
            <div className="w-full aspect-square max-h-[200px] bg-gray-900/50 overflow-hidden">
                <img
                    src={architect.photoURL}
                    alt={architect.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Name - Largest */}
                <h3 className="text-xl font-medium text-gray-100 mb-1">{architect.name}</h3>

                {/* Specialization tagline - Medium */}
                <p className="text-sm text-gray-400 mb-2">Interior Designer</p>

                {/* Location + Experience - Smallest */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {architect.city}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span>{architect.yearsExperience} years exp</span>
                </div>

                {/* Skill Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {skillTags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-gray-400"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Single Primary Button */}
                <button
                    onClick={onViewPortfolio}
                    className="w-full py-3 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-500 transition-colors"
                >
                    View Portfolio
                </button>
            </div>
        </motion.div>
    );
};

// ... Skeleton Card ...
const SkeletonCard: React.FC = () => (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-xl p-8 flex flex-col items-center animate-pulse">
        <div className="w-32 h-32 rounded-full bg-white/5 mb-6" />
        <div className="h-6 bg-white/5 rounded w-1/2 mb-3" />
        <div className="h-4 bg-white/5 rounded w-2/3 mb-4" />
        <div className="h-20 bg-white/5 rounded w-full mb-6" />
        <div className="w-full space-y-3 mt-auto">
            <div className="h-10 bg-white/5 rounded w-full" />
            <div className="h-10 bg-white/5 rounded w-full" />
        </div>
    </div>
);

// ... Profile Modal ...
const ProfileModal: React.FC<{
    architect: Architect;
    onClose: () => void;
    onSendProposal: () => void;
}> = ({ architect, onClose, onSendProposal }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
            onClick={onClose}
        >
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/60"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 p-2 text-gray-400 hover:text-white transition-colors bg-black/40 rounded-full backdrop-blur-sm"
                >
                    <X size={20} />
                </button>

                {/* Left - Portfolio Grid */}
                <div className="w-full md:w-[55%] bg-zinc-950 p-8 overflow-y-auto hide-scrollbar border-r border-white/[0.06]">
                    <h3 className="text-xl font-serif font-bold text-white mb-6">Portfolio</h3>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {architect.portfolioImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className="aspect-square rounded-lg overflow-hidden bg-white/5 hover:opacity-80 transition-all group relative"
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right - Profile Info */}
                <div className="w-full md:w-[45%] bg-black p-8 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto hide-scrollbar pr-2">
                        <div className="text-center mb-8">
                            <img
                                src={architect.photoURL}
                                alt={architect.name}
                                className="w-28 h-28 rounded-full object-cover ring-2 ring-white/10 mx-auto mb-4"
                            />
                            <h2 className="text-3xl font-serif font-bold text-white mb-1 tracking-tight">{architect.name}</h2>
                            <p className="text-gray-500 mb-2">Interior Designer</p>
                            <div className="flex justify-center gap-4 text-sm text-gray-500">
                                <span>{architect.city}</span>
                                <span>•</span>
                                <span>{architect.yearsExperience} years exp</span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wider">About</h4>
                                <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">{architect.bio}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wider">Specializations</h4>
                                <div className="flex flex-wrap gap-2">
                                    {architect.specializations.map((spec) => (
                                        <span key={spec} className="px-3 py-1 bg-white/5 border border-white/5 text-gray-300 text-xs rounded-full">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/[0.08]">
                        <button
                            onClick={onSendProposal}
                            className="w-full py-3.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20"
                        >
                            Send Proposal
                        </button>
                        <p className="text-xs text-center text-gray-600 mt-3">Pricing discussed after initial consultation</p>
                    </div>
                </div>
            </motion.div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-white/50 hover:text-white">
                            <X size={32} />
                        </button>
                        <img src={selectedImage} alt="Full size" className="max-w-full max-h-full object-contain rounded shadow-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ... ProposalModal stays mostly same, just styling ...
const ProposalModal: React.FC<{
    architect: Architect;
    projects: Project[];
    onClose: () => void;
    onSuccess: () => void;
}> = ({ architect, projects, onClose, onSuccess }) => {
    // ... logic same ...
    const { user } = useAuth();
    const [selectedProject, setSelectedProject] = useState('');
    const [budgetRange, setBudgetRange] = useState('');
    const [timeline, setTimeline] = useState('');
    const [message, setMessage] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isValid = selectedProject && budgetRange && timeline && message.length >= 50 && agreed;

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async () => {
        // ... same submit logic ...
        if (!isValid || !user) return;
        setSubmitting(true);
        try {
            // ... firebase addDoc ...
            const project = projects.find(p => p.id === selectedProject);
            await addDoc(collection(db, 'proposals'), {
                homeownerId: user.uid,
                homeownerName: user.displayName || 'Anonymous',
                homeownerEmail: user.email,
                architectId: architect.id,
                projectId: selectedProject,
                projectName: project?.name || 'New Project',
                budgetRange,
                timeline,
                message,
                status: 'pending',
                unlocked: false,
                createdAt: Timestamp.now()
            });
            onSuccess();
            onClose();
            toast.success(`Proposal sent to ${architect.name}`);
        } catch (e) {
            setSubmitting(false);
            toast.error('Failed to send');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-serif font-bold text-white">Send Proposal</h2>
                    <button onClick={onClose}><X className="text-gray-500 hover:text-white" size={20} /></button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Inputs ... */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Project</label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-200 text-sm focus:border-orange-500/50 outline-none"
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Budget</label>
                            <select value={budgetRange} onChange={e => setBudgetRange(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-200 text-sm focus:border-orange-500/50 outline-none">
                                <option value="">Select Range</option>
                                {budgetRanges.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Timeline</label>
                            <select value={timeline} onChange={e => setTimeline(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-200 text-sm focus:border-orange-500/50 outline-none">
                                <option value="">Select Timeline</option>
                                {timelines.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Message</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value.slice(0, 500))}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-200 text-sm focus:border-orange-500/50 outline-none resize-none"
                            placeholder="Describe your vision..."
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-xs text-gray-500">{message.length}/500</span>
                        </div>
                    </div>

                    <label className="flex gap-3 cursor-pointer group">
                        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5" />
                        <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">I understand pricing is discussed later.</span>
                    </label>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || submitting}
                        className="px-6 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Sending...' : 'Send Proposal'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Main Page ---
const BrowseArchitects: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [architects, setArchitects] = useState<Architect[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('All Cities');
    const [selectedSpecialization, setSelectedSpecialization] = useState('All Styles');
    const [selectedExperience, setSelectedExperience] = useState('Any Experience');
    const [sortBy, setSortBy] = useState('Best Match');
    const [selectedArchitect, setSelectedArchitect] = useState<Architect | null>(null);
    const [proposalArchitect, setProposalArchitect] = useState<Architect | null>(null);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setArchitects(mockArchitects);
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    // Filter logic ...
    const filteredArchitects = useMemo(() => {
        let result = [...architects];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a => a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.specializations.some(s => s.toLowerCase().includes(q)));
        }
        if (selectedCity !== 'All Cities') result = result.filter(a => a.city === selectedCity);
        if (selectedSpecialization !== 'All Styles') result = result.filter(a => a.specializations.includes(selectedSpecialization));
        if (selectedExperience !== 'Any Experience') {
            // ... experience logic
            result = result.filter(a => {
                const y = a.yearsExperience;
                if (selectedExperience === '0-2 years') return y <= 2;
                if (selectedExperience === '2-5 years') return y > 2 && y <= 5;
                if (selectedExperience === '5-10 years') return y > 5 && y <= 10;
                if (selectedExperience === '10+ years') return y > 10;
                return true;
            });
        }

        switch (sortBy) {
            case 'Most Experienced': result.sort((a, b) => b.yearsExperience - a.yearsExperience); break;
            case 'Newest': result.sort((a, b) => a.yearsExperience - b.yearsExperience); break;
            default: // Best Match: Studio > Freelancer > Student
                result.sort((a, b) => {
                    const score = (p?: string) => p === 'studio' ? 3 : p === 'freelancer' ? 2 : 1;
                    return score(b.selectedPlan) - score(a.selectedPlan) || (b.projectsCompleted || 0) - (a.projectsCompleted || 0);
                });
        }
        return result;
    }, [architects, searchQuery, selectedCity, selectedSpecialization, selectedExperience, sortBy]);

    return (
        <>
            <Toaster position="bottom-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #333' } }} />


            {/* Filter Bar */}
            <div className="sticky top-16 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1">
                        <div className="relative flex-shrink-0 w-64 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input
                                type="text"
                                placeholder="Search architects..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm text-gray-200 focus:bg-white/[0.05] focus:border-white/10 outline-none transition-all"
                            />
                        </div>
                        <FilterDropdown label="Location" options={cities} value={selectedCity} onChange={setSelectedCity} />
                        <FilterDropdown label="Specialization" options={specializations} value={selectedSpecialization} onChange={setSelectedSpecialization} />
                        <FilterDropdown label="Experience" options={experienceRanges} value={selectedExperience} onChange={setSelectedExperience} />
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-xs text-gray-500">{filteredArchitects.length} professionals</span>
                        <FilterDropdown label="Sort" options={sortOptions} value={sortBy} onChange={setSortBy} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">Browse Architects</h1>
                    <p className="text-base text-gray-400">Find the perfect architect or designer for your dream project</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredArchitects.length === 0 ? (
                    <div className="text-center py-32 border border-dashed border-white/10 rounded-2xl">
                        <Users className="mx-auto text-gray-700 mb-4" size={48} />
                        <h3 className="text-xl font-medium text-white">No professionals found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your filters to see more results.</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedCity('All Cities'); }} className="text-orange-500 hover:text-orange-400">Clear all filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArchitects.map(arch => (
                            <ArchitectCard
                                key={arch.id}
                                architect={arch}
                                onViewPortfolio={() => setSelectedArchitect(arch)}
                                onSendProposal={() => setProposalArchitect(arch)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modals */}
            <AnimatePresence>
                {selectedArchitect && (
                    <ProfileModal
                        architect={selectedArchitect}
                        onClose={() => setSelectedArchitect(null)}
                        onSendProposal={() => { setSelectedArchitect(null); setProposalArchitect(selectedArchitect); }}
                    />
                )}
                {proposalArchitect && (
                    <ProposalModal
                        architect={proposalArchitect}
                        projects={mockProjects}
                        onClose={() => setProposalArchitect(null)}
                        onSuccess={() => { }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default BrowseArchitects;
