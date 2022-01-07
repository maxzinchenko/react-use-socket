export type State<Res> = {
  data: Res | null,
  error: string | null
}

export type Controls = {
  stop: () => void,
}

export type LazyControls = {
  start: () => void,
  stop: () => void
}
