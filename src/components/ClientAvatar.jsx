import { CLIENT_COLORS } from '../lib/clients.js'

const SIZE = {
  sm:  'w-8 h-8 text-sm',
  md:  'w-9 h-9 text-base',
  xl:  'w-11 h-11 text-lg',
  '2xl': 'w-12 h-12 text-xl',
  lg:  'w-16 h-16 text-2xl',
}

export default function ClientAvatar({ client, size = 'md', className = '' }) {
  const colors = CLIENT_COLORS[client?.color || 'teal']
  const sizeClass = SIZE[size]

  if (client?.avatar) {
    return (
      <img
        src={client.avatar}
        alt={client.name}
        className={`${sizeClass} rounded-full flex-shrink-0 object-cover ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeClass} rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-bold flex-shrink-0 ${className}`}>
      {client?.name[0]}
    </div>
  )
}
