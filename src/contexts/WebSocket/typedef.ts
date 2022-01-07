import { ReactNode } from 'react';

import { SignalIndicator, Options, SignalListener } from '../../services/WebSocket/typedef';


export type WebSocketOptions<Req, Res, SReq extends Req = Req, DRes extends Res = Res> = Options<Req, Res, SReq, DRes> & {
  getRequestSignalIndicator: GetReqSignalIndicator<Req>,
  autoConnect?: boolean
}

export type ProviderProps<Req, Res, SReq extends Req = Req, DRes extends Res = Res> = {
  options: WebSocketOptions<Req, Res, SReq, DRes>,
  children: ReactNode | ReactNode[]
}

type GetReqSignalIndicator<Req> = (req: Req) => SignalIndicator;

export type Context<Req = any, DRes = unknown> = {
  connected: boolean;
  open: () => void,
  send: (data: any) => void,
  close: () => void,
  addSignalListener: (signal: SignalIndicator, listener: SignalListener<DRes>) => () => void,
  removeSignalListener: (signal: SignalIndicator, id: string) => void,
  getRequestSignalIndicator: GetReqSignalIndicator<Req>
}
