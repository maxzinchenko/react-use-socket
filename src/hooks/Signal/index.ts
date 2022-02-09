import { useCallback, useEffect, useRef, useState } from 'react';

import { Controls, State, Options } from './typedef';
import { SignalIndicator } from '../../services/WebSocket/typedef';
import { useWebSocketContext } from '../../contexts/WebSocket';
import { CacheService } from '../../services/Cache';


const initialState = {
  mounted: false,
  loading: false,
  error: null,
  data: null
};


const createCacheService = <Req, Res>(options?: Options, debug?: boolean) => {
  if (!options?.cache || !CacheService.isSupported(options.persist)) return;

  return new CacheService<Req, Res>({ ...options, debug });
};


export const useSignal = <Req, Res, Err = string>(req: Req, options?: Options) => {
  const { send, addSignalListener, getRequestIndicator, connected, debug } = useWebSocketContext<Req, Res, Err>();

  const signal = useRef(getRequestIndicator(req)).current;
  const cache = useRef(createCacheService<Req, Res>(options, debug)).current;
  const removeListener = useRef<(() => void) | null>(null);

  const [state, setState] = useState<State<Res, Err>>(initialState);

  const sendRequest = useCallback(async () => {
    if (!connected || state.mounted) return;

    setState(prevState => ({ ...prevState, mounted: true, loading: true, error: null }));

    send(req);
  }, [req, connected, state.mounted]);

  useEffect(() => {
    const cachedRes = cache?.get(signal, req);

    if (cachedRes) {
      setState(prevState => ({ ...prevState, mounted: true, data: cachedRes }));
    } else {
      sendRequest();
    }
  }, [connected]);

  useEffect(() => {
    removeListener.current = addSignalListener(signal, (error, response) => {
      setState(prevState => ({ ...prevState, error, loading: false, data: response }));

      if (error) {
        cache?.remove(signal, req);
      } else {
        cache?.set(signal, req, response);
      }
    });

    return removeListener.current;
  }, []);

  return state;
};


export const useLazySignal = <Req, Res, Err = string>(): [State<Res, Err>, Controls<Req>] => {
  const { send, addSignalListener, getRequestIndicator } = useWebSocketContext<Req, Res, Err>();

  const signal = useRef<SignalIndicator | null>(null);
  const request = useRef<Req | null>(null);
  const removeListener = useRef<(() => void) | null>(null);

  const [state, setState] = useState<State<Res, Err>>(initialState);

  const sendRequest = useCallback(async (req: Req) => {
    signal.current = getRequestIndicator(req);
    request.current = req;

    setState(prevState => ({
      ...prevState,
      mounted: true,
      loading: true,
      error: null
    }));

    send(req);
  }, []);

  useEffect(() => {
    if (!signal.current || !request.current) return;

    removeListener.current = addSignalListener(signal.current, (error, response) => {
      setState(prevState => ({
        ...prevState,
        loading: false,
        data: response,
        error
      }));
    });
  }, [!signal.current, !request.current]);

  useEffect(() => () => {
    removeListener.current?.();
  }, []);

  return [state, { send: sendRequest }];
};
