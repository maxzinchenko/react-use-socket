import { SerializerService } from '../../services/Serializer';
import { State } from './typedef';


const NAME = 'react-use-socket';


export class StorageService<T> {
  readonly #storage: Storage;
  readonly #name: string;

  #state: State<T> | null;

  constructor(persist?: boolean, name = NAME) {
    this.#storage = persist ? localStorage : sessionStorage;
    this.#name = name;
    this.#state = this.#getState();
  }

  static isSupported = (persist?: boolean) => {
    return Boolean(persist ? localStorage : sessionStorage);
  }

  get = (query: string): T | null => {
    if (!this.#state) return null;

    return this.#state[query];
  };

  set = (query: string, payload: T) => {
    const comparedPayload = this.#comparePayload(this.#state?.[query], payload);
    const newState = { ...this.#state, [query]: comparedPayload };

    this.#saveState(newState);
  };

  remove = (query: string) => {
    if (!this.#state) return;

    const { [query]: removedQuery, ...newState } = this.#state;

    this.#saveState(newState);
  };

  wipe = () => {
    this.#storage.removeItem(this.#name);
  };

  #comparePayload = (oldPayload: T = {} as T, newPayload: T) => {
    if (
      typeof oldPayload !== 'object' ||
      typeof newPayload !== 'object' ||
      typeof oldPayload !== typeof newPayload ||
      Array.isArray(newPayload)
    ) return newPayload;

    return { ...oldPayload, ...newPayload };
  };

  #getState = (): State<T> | null => {
    const state = this.#storage.getItem(this.#name);
    if (!state) return null;

    return SerializerService.deserializeJSON<State<T>>(state);
  };

  #saveState = (state: State<T>) => {
    this.#state = state;
    this.#storage.setItem(this.#name, SerializerService.serializeJSON(state));
  };
}
