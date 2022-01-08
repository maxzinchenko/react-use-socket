import { useWebSocketContext } from '../../contexts/WebSocket';


export const useWebSocketState = () => {
  const { connected, open, close } = useWebSocketContext<unknown, unknown>();

  return [connected, { open, close }];
};
