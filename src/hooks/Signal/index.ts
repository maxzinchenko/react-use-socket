import { useCallback, useEffect, useRef, useState } from 'react';

import { Controls, State, Options } from './typedef';
import { SignalIndicator } from '../../services/WebSocket/typedef';
import { createCacheInstance } from '../../services/Cache';
import { useWebSocketContext } from '../../contexts/WebSocket';


const initialState = {
  mounted: false,
  loading: false,
  error: null,
  data: null
};


export const useSignal = <Req, Res, Err = string>(req: Req, options?: Options) => {
  const { send, addSignalListener, getRequestIndicator, connected, debug } = useWebSocketContext<Req, Res, Err>();

  const signal = useRef(getRequestIndicator(req)).current;
  const cache = useRef(createCacheInstance<Res>(options, debug)).current;
  const removeListener = useRef<(() => void) | null>(null);

  const [state, setState] = useState<State<Res, Err>>(initialState);

  const sendRequest = useCallback(() => {
    if (!connected || state.mounted) return;

    setState(prevState => ({ ...prevState, mounted: true, loading: true, error: null }));

    send(req);
  }, [req, connected, state.mounted]);

  useEffect(() => {
    const cachedData = cache?.get(signal);

    if (cachedData) {
      setState(prevState => ({ ...prevState, mounted: true, data: cachedData }));
    } else {
      sendRequest();
    }
  }, [connected]);

  useEffect(() => {
    removeListener.current = addSignalListener(signal, (error, response) => {
      setState(prevState => ({ ...prevState, error, loading: false, data: response }));
      cache?.set(signal, error ? null : response);
    });

    return removeListener.current;
  }, []);

  return state;
};


export const useLazySignal = <Req, Res, Err = string>(options?: Options): [State<Res, Err>, Controls<Req>] => {
  const { send, addSignalListener, getRequestIndicator, debug } = useWebSocketContext<Req, Res, Err>();

  const signal = useRef<SignalIndicator | null>(null);
  const cache = useRef(createCacheInstance<Res>(options, debug)).current;
  const removeListener = useRef<(() => void) | null>(null);

  const [state, setState] = useState<State<Res, Err>>(initialState);

  const sendRequest = useCallback((req: Req) => {
    signal.current = getRequestIndicator(req);
    const cachedData = cache?.get(signal.current);

    if (cachedData && !state.mounted) {
      setState(prevState => ({ ...prevState, mounted: true, data: cachedData }));
    } else {
      setState(prevState => ({ ...prevState, mounted: true, loading: true, error: null }));

      send(req);
    }
  }, [state.mounted]);

  useEffect(() => {
    if (!signal.current) return;

    removeListener.current = addSignalListener(signal.current, (error, response) => {
      setState(prevState => ({ ...prevState, loading: false, data: response, error }));
      cache?.set(signal.current!, error ? null : response);
    });
  }, [!signal.current]);

  useEffect(() => () => {
    removeListener.current?.();
  }, []);

  return [state, { send: sendRequest }];
};
