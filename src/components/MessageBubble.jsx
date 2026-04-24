export default function MessageBubble({ message, clientName }) {
  const isClient = message.role === 'assistant'

  return (
    <div className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[78%] ${isClient ? 'order-2' : ''}`}>
        <p className={`text-xs font-medium mb-1 ${isClient ? 'text-navy-600 ml-1' : 'text-gray-400 text-right mr-1'}`}>
          {isClient ? clientName : 'You (Social Worker)'}
        </p>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isClient
            ? 'bg-navy-50 border border-navy-100 text-gray-800 rounded-tl-sm'
            : 'bg-navy-700 text-white rounded-tr-sm'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  )
}
