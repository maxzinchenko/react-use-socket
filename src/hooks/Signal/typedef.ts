import { Options as CacheServiceOptions } from '../../services/Cache/typedef';


export type State<Res, Err> = {
  mounted: boolean,
  loading: boolean,
  error: Err | null,
  data: Res | null
};

export type Controls<Req> = {
  send: (req: Req) => void;
};

export type Options = Omit<CacheServiceOptions, 'debug'> & {
  cache: boolean;
};
