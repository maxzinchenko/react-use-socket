export type State<Res, Err> = {
  data: Res | null,
  error: Err | null
}

export type Controls = {
  stop: () => void,
}

export type LazyControls = {
  start: () => void,
  stop: () => void
}

export type Options<N> = {
  name: N;
};
