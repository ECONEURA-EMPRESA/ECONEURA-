
import React from 'react';
import { ChatHistory } from './ChatHistory';

interface EconeuraModalsProps {
    chatHistoryOpen: boolean;
    setChatHistoryOpen: (open: boolean) => void;
    portalOpen: boolean;
    setPortalOpen: (open: boolean) => void;
    token: string | null;
    darkMode: boolean;
    chatContext?: string;
    userIntent?: string;
}

export function EconeuraModals({
    chatHistoryOpen,
    setChatHistoryOpen,
    portalOpen,
    setPortalOpen,
    token,
    darkMode,
    chatContext,
    userIntent
}: EconeuraModalsProps) {
    return (
        <>
            {chatHistoryOpen && (
                <ChatHistory
                    isOpen={chatHistoryOpen}
                    onClose={() => setChatHistoryOpen(false)}
                    darkMode={darkMode}
                    onSelectChat={(chat) => console.log('Selected chat:', chat)}
                    token={token || ''}
                />
            )}
        </>
    );
}
