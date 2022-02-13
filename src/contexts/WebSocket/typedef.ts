import { ReactNode } from 'react';

import { SignalIndicator, Options as WebSocket } from '../../services/WebSocket/typedef';
import { SignalListener } from '../../services/SignalListeners/typedef';
import { WebSocketService } from '../../services/WebSocket';


export type Options<Req, Res, Err = string, SReq = Req, DRes = Res> = Omit<WebSocket<Req, Res, Err, SReq, DRes>, 'name'> & {
  getRequestIndicator: GetReqIndicator<Req>;
  autoConnect?: boolean;
};

export type WebSocketOptions<Req, Res, N extends string = string, Err = string, SReq = Req, DRes = Res> = {
  [name in N]: Options<Req, Res, Err, SReq, DRes>;
};

export type ProviderProps<Req, Res, N extends string, Err, SReq = Req, DRes = Res> = {
  options: WebSocketOptions<Req, Res, N, Err, SReq, DRes>;
  children: ReactNode | ReactNode[];
}

export type ConnectedState<N extends string = string> = {
  [name in N]: boolean;
};

export type WebSockets<Req, Res, N extends string, Err = string, SReq = Req, DRes = Res> = {
  [name in N]: WebSocketService<Req, Res, Err, SReq, DRes>;
};

type GetReqIndicator<Req> = (req: Req) => SignalIndicator;

export type Context<Req = any, Res = any, N extends string = string, Err = any, SReq = Req, DRes = Res> = {
  connected: ConnectedState<N>;
  options: ProviderProps<Req, Res, N, Err, SReq, DRes>['options'];
  webSockets: WebSockets<Req, Res, N, Err, SReq, DRes>;
}

export type ContextExtended<Req, Res, Err> = {
  connected: boolean;
  open: () => void;
  send: (data: any) => void;
  close: (code?: number) => void;
  addSignalListener: (signal: SignalIndicator, listener: SignalListener<Res, Err>) => () => void;
  removeSignalListener: (signal: SignalIndicator, id: string) => void;
  getRequestIndicator: GetReqIndicator<Req>;
}
