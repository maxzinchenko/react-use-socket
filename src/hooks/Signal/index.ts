import { useCallback, useEffect, useRef, useState } from 'react';

import { Controls, State } from './typedef';
import { useWebSocketContext } from '../../contexts/WebSocket';


const initialState = {
  mounted: false,
  loading: false,
  error: null,
  data: null
};


export const useSignal = <Req, Res>(req: Req) => {
  const { send, addSignalListener, getRequestSignalIndicator, connected } = useWebSocketContext<Req, Res>();

  const removeListener = useRef<(() => void) | null>(null);
  const [state, setState] = useState<State<Res>>(initialState);

  const sendRequest = useCallback(() => {
    if (!connected || state.mounted) return;

    setState(prevState => ({ ...prevState, mounted: true, loading: true, error: null }));

    send(req);
  }, [req, connected, state.mounted]);

  useEffect(sendRequest, [connected]);

  useEffect(() => {
    const signal = getRequestSignalIndicator(req);

    removeListener.current = addSignalListener(signal, (error, response) => {
      setState(prevState => ({ ...prevState, error, loading: false, data: response }));
    });

    return removeListener.current;
  }, []);

  return state;
};


export const useLazySignal = <Req, Res>(): [State<Res>, Controls<Req>] => {
  const { send, addSignalListener, getRequestSignalIndicator } = useWebSocketContext<Req, Res>();

  const signalIndicator = useRef<string | number | null>(null);
  const removeListener = useRef<(() => void) | null>(null);
  const [state, setState] = useState<State<Res>>(initialState);

  const sendRequest = useCallback((req: Req) => {
    signalIndicator.current = getRequestSignalIndicator(req);

    setState(prevState => ({
      ...prevState,
      mounted: true,
      loading: true,
      error: null
    }));

    send(req);
  }, []);

  useEffect(() => {
    if (!signalIndicator.current) return;

    removeListener.current = addSignalListener(signalIndicator.current, (error, response) => {
      setState(prevState => ({
        ...prevState,
        loading: false,
        data: response,
        error
      }));
    });
  }, []);

  useEffect(() => () => {
    removeListener.current?.();
  }, []);

  return [state, { send: sendRequest }];
};
