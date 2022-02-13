import { CachedPayload, InstanceOptions, Options } from './typedef';
import { SignalIndicator } from '../WebSocket/typedef';
import { LoggerService } from '../Logger';
import { StorageService } from '../Storage';


export class CacheService<Res> {
  readonly #expiresIn?: number;

  readonly #loggerService?: LoggerService;
  readonly #storageService: StorageService<CachedPayload<Res>>;

  constructor(name: string, options?: Options) {
    this.#expiresIn = options?.expiresIn;

    this.#storageService = new StorageService(options?.persist);

    if (options?.debug) {
      this.#loggerService = new LoggerService(name);
    }
  }

  static isSupported = StorageService.isSupported;

  set = (signal: SignalIndicator, res?: Res | null) => {
    if (!res) return this.remove(signal);

    const payload = this.#createPayload(res);

    this.#storageService.set(signal, payload, () => {
      this.#loggerService?.log(`Updated the cache of "${signal}"`, res);
    });
  }

  get = (signal: SignalIndicator): Res | null => {
    const payload = this.#storageService.get(signal);
    if (!payload) return null;

    const { expirationDate, data } = payload;
    if (expirationDate && expirationDate < Date.now()) return this.remove(signal, true);

    this.#loggerService?.log(`Used the cache of "${signal}"`, data);

    return data;
  }

  remove = (signal: SignalIndicator, exired?: boolean) => {
    this.#storageService.remove(signal, () => {
      this.#loggerService?.log(`Removed the cache of "${signal}"${exired ? ' (expired)' : ''}`);
    });

    return null;
  }

  #createPayload = (res: Res) => {
    return { data: res, ...(this.#expiresIn ? { expirationDate: Date.now() + this.#expiresIn } : {}) };
  }
}


export const createCacheInstance = <Res>(name: string, options?: InstanceOptions, debug?: boolean) => {
  if (!options?.cache || !CacheService.isSupported(options.persist)) return;

  return new CacheService<Res>(name, { ...options, debug });
};
