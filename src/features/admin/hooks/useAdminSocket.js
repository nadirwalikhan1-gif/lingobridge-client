import { getSocket } from '../../../lib/socket'

export function useAdminSocket() {
  const emit = (event, payload) => {
    const socket = getSocket()
    if (socket) socket.emit(event, payload)
  }
  return { emit }
}
