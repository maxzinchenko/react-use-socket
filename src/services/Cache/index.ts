import { CachedPayload, Options } from './typedef';
import { SignalIndicator } from '../WebSocket/typedef';
import { SerializerService } from '../Serializer';
import { LoggerService } from '../Logger';
import { StorageService } from '../Storage';


export class CacheService<Req, Res> {
  readonly #expiresIn?: number;

  readonly #loggerService?: LoggerService;
  readonly #storageService: StorageService<CachedPayload<Res>>;

  constructor(options?: Options) {
    this.#expiresIn = options?.expiresIn;

    this.#storageService = new StorageService(options?.persist);

    if (options?.debug) {
      this.#loggerService = new LoggerService();
    }
  }

  static isSupported = StorageService.isSupported;

  set = (signal: SignalIndicator, req: Req, res: Res) => {
    const query = this.#prepareQuery(req);
    const payload = this.#createPayload(res);

    this.#storageService.set(query, payload);
    this.#loggerService?.log(`Cached data has updated for "${signal}"`, res)
  }

  get = (signal: SignalIndicator, req: Req): Res | null => {  
    const query = this.#prepareQuery(req);
    const payload = this.#storageService.get(query);
    if (!payload) return null;

    if (payload.expirationDate && payload.expirationDate < Date.now()) {
      this.#storageService.remove(query);
      this.#loggerService?.log(`Cached data for "${signal}" found but it's expired. Removing`, req);

      return null;
    }

    this.#loggerService?.log(`The data for "${signal}" is taken from cache`, req);

    return payload.data;
  }

  remove = (signal: SignalIndicator, req: Req) => {
    const query = this.#prepareQuery(req);

    this.#storageService.remove(query);
    this.#loggerService?.log(`Cached data has removed for "${signal}"`, req)
  }

  #prepareQuery = (req: Req) => {
    return SerializerService.serializeJSON(req);
  }

  #createPayload = (res: Res) => {
    return { data: res, ...(this.#expiresIn ? { expirationDate: Date.now() + this.#expiresIn } : {}) };
  }
}
