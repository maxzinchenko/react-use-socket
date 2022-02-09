export type Options = {
  debug?: boolean;
  expiresIn?: number;
  persist?: boolean;
};

export type CachedPayload<D> = {
  data: D;
  expirationDate?: number;
};
