import React, { useState } from 'react';
import { EconeuraSidebar } from '../../components/EconeuraSidebar';
import { EconeuraHeader } from '../../components/EconeuraHeader';
import { EconeuraMainContent } from '../../components/EconeuraMainContent';
import { NEURA_DATA as departments } from '../../data/neuraData';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CockpitLayoutProps {
    user?: {
        id: string;
        email: string;
        name: string;
        tenantId?: string;
    } | null;
    onLogout?: () => void;
}

export const CockpitLayout: React.FC<CockpitLayoutProps> = ({ user, onLogout }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDeptId, setActiveDeptId] = useState('CEO');

    const activeDepartment = departments.find(d => d.id === activeDeptId) || departments[0];

    // ... rest of implementation matching previous working state ...
    const handleOpenChat = () => {
        navigate(`/chat/${activeDeptId.toLowerCase()}`);
    };

    const handleExecuteAgent = (agentId: string) => {
        navigate(`/chat/${activeDeptId.toLowerCase()}?agent=${agentId}`);
    };

    return (
        <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
            <EconeuraSidebar
                departments={departments}
                activeDept={activeDeptId}
                onDeptChange={setActiveDeptId}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 md:pl-80 transition-all duration-300">
                <EconeuraHeader
                    user={user}
                    onLogout={logout}
                    onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                    <EconeuraMainContent
                        activeDept={activeDepartment}
                        onOpenChat={handleOpenChat}
                        onExecuteAgent={handleExecuteAgent}
                    />
                </main>
            </div>
        </div>
    );
};
