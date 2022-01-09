import { CloseCallback, OpenCallback, Options, OptionsShort, ShouldReconnect, SignalIndicator, WebSocketClosingCode, WebSocketEvent, WebSocketState } from './typedef';
import { SignalListener } from '../SignalListeners/typedef';
import { LoggerService } from '../Logger';
import { SerializerService } from '../Serializer';
import { SignalListenersService } from '../SignalListeners';
import { ReconnectorService } from '../Reconnector';


export class WebSocketService<Req, Res, Err, SReq = Req, DRes = Res> {
  readonly #options: OptionsShort<Req, Res, Err, SReq, DRes>;
  readonly #shouldReconnect: ShouldReconnect | boolean ;
  readonly #openCallback?: OpenCallback;
  readonly #closeCallback?: CloseCallback;

  readonly #loggerService?: LoggerService;
  readonly #reconnectorService: ReconnectorService;
  readonly #signalListenersService: SignalListenersService<Res | DRes, Err>;
  readonly #serializerService: SerializerService<Req, Res, SReq, DRes>;

  #ws: WebSocket | null = null;

  constructor(options: Options<Req, Res, Err, SReq, DRes>, openCallback?: OpenCallback, closeCallback?: CloseCallback) {
    const { shouldReconnect, reconnectionInterval, serialize, deserialize, debug, ...restOptions } = options;

    this.#options = restOptions;
    this.#shouldReconnect = shouldReconnect ?? true;

    this.#openCallback = openCallback;
    this.#closeCallback = closeCallback;

    this.#serializerService = new SerializerService(serialize, deserialize);
    this.#signalListenersService = new SignalListenersService(debug);
    this.#reconnectorService = new ReconnectorService(this.open, reconnectionInterval, debug);

    if (debug) {
      this.#loggerService = new LoggerService();
      this.#loggerService.log('Debug mode is ON', this.#options);
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

    const message = this.#serializerService.serialize(data);
    this.#ws!.send(message);

    this.#loggerService?.log('Sent', JSON.parse(message));
  }

  close = (code?: number) => {
    this.#checkOpenStateAndThrowError();

    this.#ws!.close(code);

    this.#ws = null;
  }

  /*
   * Signal Listeners Managers
   */

  addSignalListener = (indicator: SignalIndicator, listener: SignalListener<Res | DRes, Err>) => {
    return this.#signalListenersService.add(indicator, listener);
  }

  removeSignalListener = (indicator: SignalIndicator, id: string) => {
    this.#signalListenersService.remove(indicator, id);
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
    this.#loggerService?.log('Connected');

    this.#openCallback?.(event);

    this.#reconnectorService.removeJob();
  }

  #handleMessage = (event: MessageEvent) => {
    let parsedData;

    try {
      parsedData = JSON.parse(event.data);
    } catch {
      parsedData = event.data;
    }

    const data = this.#serializerService.deserialize(parsedData);

    const indicator = this.#options.getResponseIndicator(parsedData);
    const error = this.#options.getError(parsedData);

    this.#signalListenersService.ping(indicator, data, error);
  }

  #handleError = (event: Event) => {
    this.#loggerService?.error('Error', event);
  }

  #handleClose = (event: CloseEvent) => {
    this.#closeCallback?.(event);
    this.#removeListeners();

    const { code, reason } = event;
    const forceDisconnection = code === WebSocketClosingCode.FORCE_CLOSE;

    if (forceDisconnection && typeof this.#shouldReconnect === 'boolean') {
      this.#loggerService?.log('Disconnected', { code, reason });
      return;
    } else if (typeof this.#shouldReconnect === 'boolean') {
      this.#reconnectorService.startJob();
      return;
    }

    if (this.#shouldReconnect(event)) {
      this.#reconnectorService.startJob();
    }
  }

  /*
   * Throwing Error Checkers
   */

  #checkOpenStateAndThrowError = () => {
    if (this.#ws && this.#ws.readyState === WebSocketState.OPEN) return;

    throw new Error('WebSocket is not connected. Make sure it is connected before triggering an action.');
  }
}
