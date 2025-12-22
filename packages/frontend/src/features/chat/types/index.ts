import { Department } from "../../../data/neuraData";

export interface ChatMessage {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    model?: string;
    tokens?: number;
    reasoning_tokens?: number;
    cost?: number;
    references?: Array<{ index: number; docId: string; title: string; pages: string; preview: string }>;
    function_call?: {
        name: string;
        arguments: Record<string, unknown>;
        status?: string;
        result?: { message?: string };
        hitl_required?: boolean;
    };
}

export interface PendingAttachment {
    fileId: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    type: 'image' | 'file';
}

export interface ChatState {
    input: string;
    isLoading: boolean;
    messages: ChatMessage[];
    isUploading: boolean;
    isUploadingAttachment: boolean;
    pendingAttachment: PendingAttachment | null;
    voiceSupported: boolean;
    listening: boolean;
    agentExecutionOpen: boolean;
}

export interface NeuraChatProps {
    isOpen?: boolean;
    onClose?: () => void;
    dept?: Department;
    deptId?: string;
    // State passed from parent (temporarily, until we fully decouple logic)
    messages: ChatMessage[];
    input: string;
    setInput: (val: string) => void;
    onSend: () => void;
    isLoading: boolean;
    pendingAttachment: PendingAttachment | null;
    onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAttachmentUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading?: boolean;
    isUploadingAttachment?: boolean;
    onRemoveAttachment: () => void;
    onSuggestionClick?: (sug: any) => void;
    darkMode: boolean;
    voiceSupported?: boolean;
    listening?: boolean;
    onToggleListen?: () => void;
    onSpeak?: (text: string) => void;
    agentExecutionOpen?: boolean;
    onCloseAgentExecution?: () => void;
}
