import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Search, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { name: 'Projects', path: '/dashboard' },
        { name: 'Marketplace', path: '/marketplace' },
        { name: 'Browse Architects', path: '/architects' },
    ];

    const handleSignOut = async () => {
        try {
            // Assuming signOut is available from useAuth, otherwise just clear and nav
            if (signOut) await signOut();
            navigate('/');
        } catch (error) {
            console.error('Failed to sign out', error);
        }
    };

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-400 group-hover:opacity-90 transition-opacity" />
                        <span className="text-lg font-serif font-bold tracking-tight text-white">dimensionloop</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = location.pathname.startsWith(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative text-sm font-medium transition-colors pb-0.5 ${isActive
                                            ? 'text-blue-400'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Placeholder for potential global search or other actions */}

                    <div className="w-px h-4 bg-white/10 hidden md:block" />

                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-full transition-colors group"
                        >
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="User"
                                    className="w-8 h-8 rounded-full ring-2 ring-white/10 group-hover:ring-white/20 transition-all object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 ring-2 ring-white/10">
                                    <UserIcon size={16} />
                                </div>
                            )}
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                                        <p className="text-sm font-medium text-white truncate">{user?.displayName || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                                        <Settings size={14} /> Settings
                                    </button>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                    >
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
};
