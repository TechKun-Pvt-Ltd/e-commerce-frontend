"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const router = useRouter();
    const { user } = useAppSelector(state => state.auth);

    // Check if user is authenticated and has admin role
    // React.useEffect(() => {
    //     if (!user || user.role.name !== 'ADMIN') {
    //         router.push('/login');
    //     }
    // }, [user, router]);

    // Show loading state while checking authentication
    // if (!user) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    //         </div>
    //     );
    // }

    return <>{children}</>;
};

export default AdminLayout; 