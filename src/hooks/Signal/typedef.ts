export type State<Res> = {
  mounted: boolean,
  loading: boolean,
  error: string | null,
  data: Res | null
};

export type Controls<Req> = {
  send: (req: Req) => void
}
