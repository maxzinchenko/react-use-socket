import { RandomService } from '../Random';
import { SignalIndicator } from '../WebSocket/typedef';
import { SignalListenerData, SignalListener } from './typedef';
import { LoggerService } from '../Logger';

export class SignalListenersService<Res, Err> {
  readonly #loggerService?: LoggerService;
  readonly #randomService: RandomService;

  #listeners: SignalListenerData<Res, Err>[] = []

  constructor(debug?: boolean) {
    this.#randomService = new RandomService();

    if (debug) {
      this.#loggerService = new LoggerService();
    }
  }

  add = (indicator: SignalIndicator, listener: SignalListener<Res, Err>) => {
    const id = this.#randomService.generateString();
    this.#listeners = [...this.#listeners, { id, indicator, listener }];

    this.#loggerService?.log(`Added listener for "${indicator}"`, { id });

    return () => this.remove(indicator, id);
  }

  remove = (indicator: SignalIndicator, id: string) => {
    if (!this.#listeners.length) return;

    this.#listeners = this.#listeners.filter(listener => listener.indicator === indicator && listener.id === id);

    this.#loggerService?.log(`Removed listener for "${indicator}"`, { id });
  }

  ping = (indicator: SignalIndicator, data: Res, error: Err | null) => {
    const listeners = this.#getListeners(indicator);

    this.#loggerService?.log(!listeners?.length ? 'Ignored (no listeners)' : 'Received', data);

    if (listeners.length) {
      listeners.forEach(({ listener }) => {
        listener(error, data);
      });
    }
  }

  #getListeners = (indicator: SignalIndicator) => {
    return this.#listeners.filter(listener => listener.indicator === indicator);
  }
}
