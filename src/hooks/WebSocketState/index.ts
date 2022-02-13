import { Controls, Options } from './typedef';
import { useWebSocketContext } from '../../contexts/WebSocket';


export const useWebSocketState = <N extends string = string>(options?: Options<N>): [boolean, Controls] => {
  const { connected, open, close } = useWebSocketContext<unknown, unknown, N>(options?.name);

  return [connected, { open, close }];
};
