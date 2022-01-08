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

export enum LogType {
  LOG = 'log',
  ERROR = 'error',
  WARNING = 'warn'
}

export type SignalListenerData<DRes, Err> = {
  id: string,
  listener: SignalListener<DRes, Err>
};
export type SignalListener<DRes, Err> = (error: Err | null, response: DRes) => void;
export type SignalListeners<DRes, Err> = { [signal in SignalIndicator]: SignalListenerData<DRes, Err>[] };

export type OpenCallback = (event: Event) => void;
export type CloseCallback = (event: CloseEvent) => void;
