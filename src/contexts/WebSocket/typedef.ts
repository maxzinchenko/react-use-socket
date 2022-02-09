import { ReactNode } from 'react';

import { SignalIndicator, Options } from '../../services/WebSocket/typedef';
import { SignalListener } from '../../services/SignalListeners/typedef';


export type WebSocketOptions<Req, Res, Err = string, SReq = Req, DRes = Res> = Options<Req, Res, Err, SReq, DRes> & {
  getRequestIndicator: GetReqIndicator<Req>;
  autoConnect?: boolean;
}

export type ProviderProps<Req, Res, Err, SReq = Req, DRes = Res> = {
  options: WebSocketOptions<Req, Res, Err, SReq, DRes>;
  children: ReactNode | ReactNode[];
}

type GetReqIndicator<Req> = (req: Req) => SignalIndicator;

export type Context<Req = any, DRes = any, Err = any> = {
  connected: boolean;
  open: () => void;
  send: (data: any) => void;
  close: (code?: number) => void;
  addSignalListener: (signal: SignalIndicator, listener: SignalListener<DRes, Err>) => () => void;
  removeSignalListener: (signal: SignalIndicator, id: string) => void;
  getRequestIndicator: GetReqIndicator<Req>;
  debug?: boolean;
}
