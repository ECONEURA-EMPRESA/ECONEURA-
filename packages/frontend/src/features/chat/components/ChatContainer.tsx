import React, { useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatComposer } from "./ChatComposer";
import { AgentExecutionPanel } from "./AgentExecutionPanel";
import { NeuraChatProps } from "../types";

export function ChatContainer({
    isOpen,
    onClose,
    dept,
    deptId,
    messages,
    input,
    setInput,
    onSend,
    isLoading,
    pendingAttachment,
    onUpload,
    isUploading,
    onRemoveAttachment,
    darkMode,
    voiceSupported,
    listening,
    onToggleListen,
    onSpeak,
    agentExecutionOpen,
    onCloseAgentExecution
}: NeuraChatProps) {

    // Auto-focus logic could go here if needed

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/5 z-50 animate-fadeIn" onClick={onClose}>
            <aside
                className="absolute right-0 top-0 h-full w-full md:w-[1160px] bg-white overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{
                    transform: 'perspective(2000px) rotateY(-1deg)',
                    transformStyle: 'preserve-3d',
                    boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.12), -10px 0 30px rgba(0, 0, 0, 0.08), inset 1px 0 0 rgba(255, 255, 255, 0.5)',
                    animation: 'slideInRightPremium 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Header */}
                <ChatHeader dept={dept} deptId={deptId} onClose={onClose} />

                {/* Messages Area */}
                <ChatMessageList
                    messages={messages}
                    isLoading={isLoading}
                    darkMode={darkMode}
                    setInput={setInput}
                    voiceSupported={voiceSupported}
                    onSpeak={onSpeak}
                />

                {/* Composer */}
                <ChatComposer
                    input={input}
                    setInput={setInput}
                    onSend={onSend}
                    isLoading={isLoading}
                    pendingAttachment={pendingAttachment}
                    isUploading={isUploading}
                    onUpload={onUpload}
                    onRemoveAttachment={onRemoveAttachment}
                    voiceSupported={voiceSupported}
                    listening={listening}
                    onToggleListen={onToggleListen}
                />
            </aside>

            {/* Agent Panel Overlay */}
            <AgentExecutionPanel
                visible={agentExecutionOpen}
                onClose={onCloseAgentExecution}
                chatContext={messages.map(m => m.text).join('\n')}
                userIntent={messages[messages.length - 1]?.text}
            />
        </div>
    );
}
