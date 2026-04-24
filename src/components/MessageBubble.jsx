import { CLIENT_COLORS, CLIENTS } from '../lib/clients.js'

export default function MessageBubble({ message, clientId }) {
  const isClient = message.role === 'assistant'
  const client = CLIENTS[clientId]
  const colors = CLIENT_COLORS[client?.color || 'teal']

  return (
    <div className={`flex items-end gap-2.5 ${isClient ? 'justify-start' : 'justify-end'}`}>
      {isClient && (
        <div className={`w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-bold flex-shrink-0 mb-0.5`}>
          {client?.name[0]}
        </div>
      )}
      <div className={`max-w-[75%]`}>
        <p className={`text-xs font-medium mb-1 ${isClient ? `${colors.text} ml-1` : 'text-gray-400 text-right mr-1'}`}>
          {isClient ? client?.name : 'You'}
        </p>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isClient
            ? `bg-white border border-warm-100 shadow-softer text-gray-800 rounded-bl-sm`
            : 'bg-sage-600 text-white rounded-br-sm shadow-soft'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  )
}
