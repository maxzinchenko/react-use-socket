import { SignalIndicator } from '../WebSocket/typedef';

export type SignalListener<Res, Err> = (error: Err | null, response: Res) => void;

export type SignalListenerData<Res, Err> = {
  id: string
  indicator: SignalIndicator
  listener: SignalListener<Res, Err>
};
