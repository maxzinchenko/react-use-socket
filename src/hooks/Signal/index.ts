import { useCallback, useEffect, useRef, useState } from 'react';

import { Controls, State, Options } from './typedef';
import { SignalIndicator } from '../../services/WebSocket/typedef';
import { CacheService } from '../../services/Cache';
import { useWebSocketContext } from '../../contexts/WebSocket';


const initialState = {
  mounted: false,
  loading: false,
  error: null,
  data: null
};


const createCacheService = <Res>(options?: Options, debug?: boolean) => {
  if (!options?.cache || !CacheService.isSupported(options.persist)) return;

  return new CacheService<Res>({ ...options, debug });
};


export const useSignal = <Req, Res, Err = string>(req: Req, options?: Options) => {
  const { send, addSignalListener, getRequestIndicator, connected, debug } = useWebSocketContext<Req, Res, Err>();

  const signal = useRef(getRequestIndicator(req)).current;
  const cache = useRef(createCacheService<Res>(options, debug)).current;
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
    if (!signal || state.loading || !state.mounted) return;

    if (state.error || !state.data) {
      cache?.remove(signal);
    } else {
      cache?.set(signal, state.data);
    }
  }, [state.loading]);

  useEffect(() => {
    removeListener.current = addSignalListener(signal, (error, response) => {
      setState(prevState => ({ ...prevState, error, loading: false, data: response }));
    });

    return removeListener.current;
  }, []);

  return state;
};


export const useLazySignal = <Req, Res, Err = string>(options?: Options): [State<Res, Err>, Controls<Req>] => {
  const { send, addSignalListener, getRequestIndicator, debug } = useWebSocketContext<Req, Res, Err>();

  const signal = useRef<SignalIndicator | null>(null);
  const cache = useRef(createCacheService<Res>(options, debug)).current;
  const removeListener = useRef<(() => void) | null>(null);

  const [state, setState] = useState<State<Res, Err>>(initialState);

  const sendRequest = useCallback(async (req: Req) => {
    const signalIndicator = getRequestIndicator(req);
    signal.current = signalIndicator;
    const cachedData = cache?.get(signalIndicator);

    if (cachedData) {
      setState(prevState => ({ ...prevState, mounted: true, data: cachedData }));
    } else {
      setState(prevState => ({ ...prevState, mounted: true, loading: true, error: null }));

      send(req);
    }
  }, []);

  useEffect(() => {
    if (!signal.current) return;

    removeListener.current = addSignalListener(signal.current, (error, response) => {
      setState(prevState => ({ ...prevState, loading: false, data: response, error }));
    });
  }, [!signal.current]);

  useEffect(() => {
    if (!signal.current || state.loading || !state.mounted) return;

    if (state.error || !state.data) {
      cache?.remove(signal.current);
    } else {
      cache?.set(signal.current, state.data);
    }
  }, [state.loading]);

  useEffect(() => () => {
    removeListener.current?.();
  }, []);

  return [state, { send: sendRequest }];
};
