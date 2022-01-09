import { useWebSocketContext } from '../../contexts/WebSocket';
import { Controls } from './typedef';


export const useWebSocketState = (): [boolean, Controls] => {
  const { connected, open, close } = useWebSocketContext<unknown, unknown>();

  return [connected, { open, close }];
};
