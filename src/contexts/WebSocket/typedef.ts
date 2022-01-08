import { ReactNode } from 'react';

import { SignalIndicator, Options, SignalListener } from '../../services/WebSocket/typedef';


export type WebSocketOptions<Req, Res, Err, SReq = Req, DRes = Res> = Options<Req, Res, Err, SReq, DRes> & {
  getRequestSignalIndicator: GetReqSignalIndicator<Req>,
  autoConnect?: boolean
}

export type ProviderProps<Req, Res, Err = string, SReq = Req, DRes = Res> = {
  options: WebSocketOptions<Req, Res, Err, SReq, DRes>,
  children: ReactNode | ReactNode[]
}

type GetReqSignalIndicator<Req> = (req: Req) => SignalIndicator;

export type Context<Req = any, DRes = any, Err = any> = {
  connected: boolean;
  open: () => void,
  send: (data: any) => void,
  close: () => void,
  addSignalListener: (signal: SignalIndicator, listener: SignalListener<DRes, Err>) => () => void,
  removeSignalListener: (signal: SignalIndicator, id: string) => void,
  getRequestSignalIndicator: GetReqSignalIndicator<Req>
}
