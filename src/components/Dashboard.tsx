import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import HomeownerDashboard from './dashboard/HomeownerDashboard';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            if (user) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setRole(docSnap.data().role);
                    }
                } catch (error) {
                    console.warn('Failed to fetch user role, continuing with default:', error);
                    // Continue without role - will use default
                }
            }
            setLoading(false);
        };
        fetchRole();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Default to Homeowner Dashboard for now, or simplified view if role missing
    return <HomeownerDashboard />;
};

export default Dashboard;
