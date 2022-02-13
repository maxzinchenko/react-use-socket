import { useCallback, useEffect, useRef, useState } from 'react';

import { Controls, Options, State } from './typedef';
import { SignalIndicator } from '../../services/WebSocket/typedef';
import { useWebSocketContext } from '../../contexts/WebSocket';


const initialState = {
  mounted: false,
  loading: false,
  error: null,
  data: null
};


export const useSignal = <
  Req,
  Res,
  N extends string = string,
  Err = string
>(req: Req, options?: Options<N>) => {
  const { send, addSignalListener, getRequestIndicator, connected } = useWebSocketContext<Req, Res, N, Err>(options?.name);

  const signal = useRef(getRequestIndicator(req)).current;
  const removeListener = useRef<(() => void) | null>(null);

  const [state, setState] = useState<State<Res, Err>>(initialState);

  const sendRequest = useCallback(() => {
    if (!connected || state.mounted) return;

    setState(prevState => ({ ...prevState, mounted: true, loading: true, error: null }));

    send(req);
  }, [req, connected, state.mounted]);

  useEffect(() => {
    if (!connected) return;

    sendRequest();
  }, [connected]);

  useEffect(() => {
    removeListener.current = addSignalListener(signal, (error, response) => {
      setState(prevState => ({ ...prevState, error, loading: false, data: response }));
    });

    return removeListener.current;
  }, []);

  return state;
};


export const useLazySignal = <
  Req,
  Res,
  N extends string = string,
  Err = string
>(options?: Options<N>): [State<Res, Err>, Controls<Req>] => {
  const { send, addSignalListener, getRequestIndicator } = useWebSocketContext<Req, Res, N, Err>(options?.name);

  const signal = useRef<SignalIndicator | null>(null);
  const removeListener = useRef<(() => void) | null>(null);

  const [state, setState] = useState<State<Res, Err>>(initialState);

  const sendRequest = useCallback((req: Req) => {
    signal.current = getRequestIndicator(req);

    setState(prevState => ({ ...prevState, mounted: true, loading: true, error: null }));

    send(req);
  }, [state.mounted]);

  useEffect(() => {
    if (!signal.current) return;

    removeListener.current = addSignalListener(signal.current, (error, response) => {
      setState(prevState => ({ ...prevState, loading: false, data: response, error }));
    });
  }, [!signal.current]);

  useEffect(() => () => {
    removeListener.current?.();
  }, []);

  return [state, { send: sendRequest }];
};
