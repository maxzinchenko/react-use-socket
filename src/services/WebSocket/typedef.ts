export enum WebSocketEvent {
  OPEN = 'open',
  MESSAGE = 'message',
  ERROR = 'error',
  CLOSE = 'close'
}

export enum WebSocketState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED
}

export enum WebSocketClosingCode {
  FORCE_CLOSE = 1001
}

export type SignalIndicator = string | number;

export type ShouldReconnect = (event: CloseEvent) => boolean;

export type Options<Req, Res, Err = string, SReq = Req, DRes = Res> = {
  url: string,
  getResponseIndicator: (res: Res) => SignalIndicator,
  getError: (res: Res) => Err | null,
  protocols?: string | string[],
  shouldReconnect?: ShouldReconnect | boolean,
  reconnectionInterval?: number | number[],
  serialize?: (req: Req) => SReq,
  deserialize?: (res: Res) => DRes,
  debug?: boolean
}

type Short = 'shouldReconnect' | 'reconnectionInterval' | 'deserialize' | 'serialize' | 'debug';

export type OptionsShort<
  Req,
  Res,
  Err = string,
  SReq = Req,
  DRes = Res
> = Omit<Options<Req, Res, Err, SReq, DRes>, Short>

export type OpenCallback = (event: Event) => void;
export type CloseCallback = (event: CloseEvent) => void;
