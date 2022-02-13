export type Controls = {
  open: () => void
  close: (code?: number) => void
}

export type Options<N> = {
  name: N;
}
