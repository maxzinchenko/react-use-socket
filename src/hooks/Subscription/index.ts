import { useCallback, useEffect, useRef, useState } from 'react';

import { Controls, LazyControls, Options, State } from './typedef';
import { SignalIndicator } from '../../services/WebSocket/typedef';
import { useWebSocketContext } from '../../contexts/WebSocket';
import { createCacheInstance } from '../../services/Cache';


const initialState = {
  data: null,
  error: null
};


export const useSubscription = <
  Res,
  Err = string,
  Signal extends SignalIndicator = SignalIndicator
>(signal: Signal, options?: Options): [State<Res, Err>, Controls] => {
  const { addSignalListener, debug } = useWebSocketContext<unknown, Res, Err>();

  const cache = useRef(createCacheInstance<Res>(options, debug)).current;
  const removeListener = useRef<(() => void) | null>(null);

  const [state, setState] = useState<State<Res, Err>>(initialState);

  useEffect(() => {
    const cachedData = cache?.get(signal);

    if (cachedData) {
      setState(prevState => ({ ...prevState, mounted: true, data: cachedData }));
    }

    removeListener.current = addSignalListener(signal, (error, response) => {
      setState({ error, data: response });
      cache?.set(signal, error ? null : response);
    });

    return removeListener.current;
  }, []);

  const stop = useCallback(() => {
    removeListener.current?.();
  }, []);

  return [state, { stop }];
};


export const useLazySubscription = <
  Res,
  Err = string,
  Signal extends SignalIndicator = SignalIndicator
  >(signal: Signal, options?: Options): [State<Res, Err>, LazyControls] => {
  const { addSignalListener, debug } = useWebSocketContext<unknown, Res, Err>();

  const cache = useRef(createCacheInstance<Res>(options, debug)).current;
  const removeListener = useRef<(() => void) | null>(null);

  const [state, setState] = useState<State<Res, Err>>(initialState);

  useEffect(() => () => {
    removeListener.current?.();
  }, []);

  const start = useCallback(() => {
    const cachedData = cache?.get(signal);

    if (cachedData) {
      setState(prevState => ({ ...prevState, mounted: true, data: cachedData }));
    }

    removeListener.current = addSignalListener(signal, (error, response) => {
      setState({ error, data: response });
      cache?.set(signal, error ? null : response);
    });
  }, []);

  const stop = useCallback(() => {
    removeListener.current?.();
  }, []);

  return [state, { start, stop }];
};
