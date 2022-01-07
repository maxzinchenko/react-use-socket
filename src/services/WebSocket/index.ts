import {
  CloseCallback,
  LogType,
  OpenCallback,
  Options,
  ShouldReconnect,
  SignalIndicator,
  SignalListener,
  SignalListeners,
  WebSocketClosingCode,
  WebSocketEvent,
  WebSocketState
} from './typedef';


const RECONNECTION_INTERVAL = 1000;


export class WebSocketService<Req, Res, SReq extends Req = Req, DRes extends Res = Res> {
  readonly #options: Omit<Options<Req, Res, SReq, DRes>, 'shouldReconnect' | 'reconnectionInterval'>;
  readonly #shouldReconnect: ShouldReconnect | boolean ;
  readonly #reconnectionInterval: number | number[];
  readonly #openCallback?: OpenCallback;
  readonly #closeCallback?: CloseCallback;

  #ws: WebSocket | null = null;
  #reconnections = 0;
  #timeout: NodeJS.Timeout | null = null;
  #signalListeners: SignalListeners<DRes> | null = null;

  constructor(options: Options<Req, Res, SReq, DRes>, openCallback?: OpenCallback, closeCallback?: CloseCallback) {
    const { shouldReconnect, reconnectionInterval, ...restOptions } = options;

    this.#options = restOptions;
    this.#shouldReconnect = shouldReconnect ?? true;
    this.#reconnectionInterval = reconnectionInterval ?? RECONNECTION_INTERVAL;

    this.#openCallback = openCallback;
    this.#closeCallback = closeCallback;

    if (options.debug) {
      this.#log(LogType.LOG, 'Debug mode is ON', this.#options);
    }
  }

  /*
   * WS Instance State Managers
   */

  open = () => {
    const { url, protocols } = this.#options;

    if (typeof window === 'undefined') return;

    this.#ws = new WebSocket(url, protocols);
    this.#setListeners();
  }

  send = (data: Req) => {
    this.#checkOpenStateAndThrowError();

    const message = this.#serializeData(data);
    this.#ws!.send(message);

    this.#log(LogType.LOG, 'Sent', message);
  }

  close = (code?: number) => {
    this.#checkOpenStateAndThrowError();

    this.#ws!.close(code);
    this.#removeListeners();

    this.#ws = null;
  }

  /*
   * Signal Listeners Managers
   */

  addSignalListener = (indicator: SignalIndicator, listener: SignalListener<DRes>) => {
    const id = this.#generateRandomString();

    const listeners = this.#signalListeners?.[indicator] || [];
    this.#signalListeners = { ...this.#signalListeners, [indicator]: [...listeners, { id, listener }] };

    this.#log(LogType.LOG, `Added listener for "${indicator}"`, { id });

    return () => this.removeSignalListener(indicator, id);
  }

  removeSignalListener = (indicator: SignalIndicator, targetId: string) => {
    if (!this.#signalListeners?.[indicator]) return;

    const listeners = this.#signalListeners?.[indicator];
    this.#signalListeners = { ...this.#signalListeners, [indicator]: listeners.filter(({ id }) => id !== targetId) };

    this.#log(LogType.LOG, `Removed listener for "${indicator}"`, { id: targetId });
  }

  /*
   * Event Listeners Managers
   */

  #setListeners = () => {
    if (!this.#ws) return;

    this.#ws.addEventListener(WebSocketEvent.OPEN, this.#handleOpen);
    this.#ws.addEventListener(WebSocketEvent.MESSAGE, this.#handleMessage);
    this.#ws.addEventListener(WebSocketEvent.ERROR, this.#handleError);
    this.#ws.addEventListener(WebSocketEvent.CLOSE, this.#handleClose);
  }

  #removeListeners = () => {
    if (!this.#ws) return;

    this.#ws.removeEventListener(WebSocketEvent.OPEN, this.#handleOpen);
    this.#ws.removeEventListener(WebSocketEvent.MESSAGE, this.#handleMessage);
    this.#ws.removeEventListener(WebSocketEvent.ERROR, this.#handleError);
    this.#ws.removeEventListener(WebSocketEvent.CLOSE, this.#handleClose);
  }

  /*
   * Event Handlers
   */

  #handleOpen = (event: Event) => {
    this.#log(LogType.LOG, 'Connected');

    this.#openCallback?.(event);
    this.#removeReconnectionJob();
  }

  #handleMessage = (event: MessageEvent) => {
    const data = this.#deserializeData(event.data);

    const meta = this.#options.getResponseSignalMeta(data);
    const listeners = this.#signalListeners?.[meta.signalIndicator];

    listeners?.forEach(({ listener }) => {
      listener(meta.error, data);
    });

    this.#log(LogType.LOG, !listeners?.length ? 'Ignored (no listener)' : 'Received', data);
  }

  #handleError = (event: Event) => {
    this.#log(LogType.ERROR, 'Error', event);
  }

  #handleClose = (event: CloseEvent) => {
    this.#closeCallback?.(event);

    const { code, reason } = event;
    const forceDisconnection = code === WebSocketClosingCode.FORCE_CLOSE;

    if (forceDisconnection && typeof this.#shouldReconnect === 'boolean') {
      this.#log(LogType.LOG, 'Disconnected', { code, reason });
      return;
    } else if (typeof this.#shouldReconnect === 'boolean') {
      this.#startReconnectionJob();
      return;
    }

    if (this.#shouldReconnect(event)) {
      this.#startReconnectionJob();
    }
  }

  /*
   * Reconnection Managers
   */

  #getReconnectionInterval = (interval = this.#reconnectionInterval) => {
    if (typeof interval === 'number') return interval;
    if (interval.length) return 0;

    const lastIntervalsIdx = interval.length - 1;

    if (this.#reconnections <= lastIntervalsIdx) {
      return interval[this.#reconnections];
    }

    return interval[lastIntervalsIdx];
  }

  #startReconnectionJob = () => {
    const interval = this.#getReconnectionInterval();

    this.#log(LogType.LOG, `Disconnected. Reconnect in ${interval} milliseconds`);

    this.#timeout = setTimeout(this.open, interval);
    this.#incrementReconnectionCount();
  }

  #removeReconnectionJob = () => {
    clearTimeout(this.#timeout!);
    this.#timeout = null;
    this.#reconnections = 0;
  }

  #incrementReconnectionCount = (start = this.#reconnections) => {
    this.#reconnections = start + 1;
  }

  /*
   * Data Type Managers
   */

  #serializeData = (data: Req) => {
    const serializedData = this.#options.serialize?.(data) || data;

    return typeof serializedData === 'string' ? serializedData : JSON.stringify(data);
  }

  #deserializeData = (data: string) => {
    const deserializedData = this.#options.deserialize?.(JSON.parse(data)) || data;

    return typeof deserializedData === 'string' ? JSON.parse(deserializedData) : deserializedData;
  }

  /*
   * Throwing Error Checkers
   */

  #checkOpenStateAndThrowError = () => {
    if (this.#ws && this.#ws.readyState === WebSocketState.OPEN) return;

    throw new Error('WebSocket is not connected. Make sure it is connected before triggering an action.');
  }

  /*
   * Loggers
   */

  #log = (type: LogType, title: string, rawInfo?: string | object | null) => {
    if (!this.#options.debug) return;

    const info = typeof rawInfo === 'string' ? JSON.parse(rawInfo) : rawInfo;

    if (type === LogType.LOG) {
      console.groupCollapsed('[awesome-websocket]', title);
      console.log(...(info ? [info] : []));
      console.groupEnd();
    } else {
      console[type](`[awesome-websocket] ${title}`, '\n', ...(info ? [info] : []));
    }
  }

  /*
   * Random Managers
   */

  #generateRandomString = () => {
    return `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
  }
}
