interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <div>Envía un mensaje para comenzar la conversación</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-100'
            }`}
          >
            <div className="flex items-start space-x-2">
              <div className="text-lg">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="flex-1">
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] p-4 rounded-lg bg-gray-700">
            <div className="flex items-center space-x-3">
              <div className="text-lg">🤖</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
