import React, { useRef, useEffect } from "react";
import { Brain } from "lucide-react";
import { ChatMessage } from "../types";
import { WelcomeMessage } from "./WelcomeMessage";
import { ChatMessageItem } from "./ChatMessageItem";

interface ChatMessageListProps {
    messages: ChatMessage[];
    isLoading: boolean;
    darkMode: boolean;
    setInput: (val: string) => void;
    voiceSupported?: boolean;
    onSpeak?: (text: string) => void;
}

export function ChatMessageList({ messages, isLoading, darkMode, setInput, voiceSupported, onSpeak }: ChatMessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom only when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent relative bg-gradient-to-b from-slate-50 via-white to-slate-50">

            {/* Welcome Message */}
            {messages.length === 0 && (
                <WelcomeMessage setInput={setInput} />
            )}

            {/* Message List */}
            <div className="space-y-8 relative">
                {messages.map((m, idx) => (
                    <ChatMessageItem
                        key={m.id}
                        message={m}
                        darkMode={darkMode}
                        idx={idx}
                        voiceSupported={voiceSupported}
                        onSpeak={onSpeak}
                    />
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex items-start gap-3 px-8 py-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                            <Brain className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
