import { SignalIndicator } from '../WebSocket/typedef';


export type State<T> = {
  [query in SignalIndicator]: T;
};

export type Callback = () => void;

