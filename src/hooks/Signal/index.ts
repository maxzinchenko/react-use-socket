import { useCallback, useEffect, useRef, useState } from 'react';

import { Controls, State } from './typedef';
import { useWebSocketContext } from '../../contexts/WebSocket';


const initialState = {
  mounted: false,
  loading: false,
  error: null,
  data: null
};


export const useSignal = <Req, Res, Err = string>(req: Req) => {
  const { send, addSignalListener, getRequestIndicator, connected } = useWebSocketContext<Req, Res, Err>();

  const removeListener = useRef<(() => void) | null>(null);
  const [state, setState] = useState<State<Res, Err>>(initialState);

  const sendRequest = useCallback(() => {
    if (!connected || state.mounted) return;

    setState(prevState => ({ ...prevState, mounted: true, loading: true, error: null }));

    send(req);
  }, [req, connected, state.mounted]);

  useEffect(sendRequest, [connected]);

  useEffect(() => {
    const signal = getRequestIndicator(req);

    removeListener.current = addSignalListener(signal, (error, response) => {
      setState(prevState => ({ ...prevState, error, loading: false, data: response }));
    });

    return removeListener.current;
  }, []);

  return state;
};


export const useLazySignal = <Req, Res, Err = string>(): [State<Res, Err>, Controls<Req>] => {
  const { send, addSignalListener, getRequestIndicator } = useWebSocketContext<Req, Res, Err>();

  const signalIndicator = useRef<string | number | null>(null);
  const removeListener = useRef<(() => void) | null>(null);
  const [state, setState] = useState<State<Res, Err>>(initialState);

  const sendRequest = useCallback((req: Req) => {
    signalIndicator.current = getRequestIndicator(req);

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
  }, [signalIndicator.current]);

  useEffect(() => () => {
    removeListener.current?.();
  }, []);

  return [state, { send: sendRequest }];
};
