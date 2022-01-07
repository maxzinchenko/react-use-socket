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
type ResMeta = {
  error: string | null,
  signalIndicator: SignalIndicator
}

export type ShouldReconnect = (event: CloseEvent) => boolean;
type Serialize<Req, SReq = Req> = (req: Req) => SReq;
type Deserialize<Res, DRes = Res> = (res: Res) => DRes;
type GetResSignalMeta<DRes> = (res: DRes) => ResMeta;
type CheckError<DRes> = (res: DRes) => boolean;

export type Options<Req, Res, SReq extends Req = Req, DRes extends Res = Res> = {
  url: string,
  getResponseSignalMeta: GetResSignalMeta<DRes>,
  checkError: CheckError<DRes>,
  protocols?: string | string[],
  shouldReconnect?: ShouldReconnect | boolean,
  reconnectionInterval?: number | number[],
  serialize?: Serialize<Req, SReq>,
  deserialize?: Deserialize<Res, DRes>,
  debug?: boolean
}

export enum LogType {
  LOG = 'log',
  ERROR = 'error',
  WARNING = 'warn'
}

export type SignalListenerData<DRes> = {
  id: string,
  listener: SignalListener<DRes>
};
export type SignalListener<DRes> = (error: string | null, response: DRes) => void;
export type SignalListeners<DRes> = { [signal in SignalIndicator]: SignalListenerData<DRes>[] };

export type OpenCallback = (event: Event) => void;
export type CloseCallback = (event: CloseEvent) => void;
