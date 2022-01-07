import { useCallback, useEffect, useRef, useState } from 'react';

import { SignalIndicator } from '../../services/WebSocket/typedef';
import { Controls, LazyControls, State } from './typedef';
import { useWebSocketContext } from '../../contexts/WebSocket';


const initialState = {
  data: null,
  error: null
};


export const useSubscription = <
  Res,
  Signal extends SignalIndicator = SignalIndicator
>(signal: Signal): [State<Res>, Controls] => {
  const { addSignalListener } = useWebSocketContext<unknown, Res>();

  const removeListener = useRef<(() => void) | null>(null);
  const [state, setState] = useState<State<Res>>(initialState);

  useEffect(() => {
    removeListener.current = addSignalListener(signal, (error, response) => {
      setState({ error, data: response });
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
  Signal extends SignalIndicator = SignalIndicator
  >(signal: Signal): [State<Res>, LazyControls] => {
  const { addSignalListener } = useWebSocketContext<unknown, Res>();

  const removeListener = useRef<(() => void) | null>(null);
  const [state, setState] = useState<State<Res>>(initialState);

  useEffect(() => () => {
    removeListener.current?.();
  }, []);

  const start = useCallback(() => {
    removeListener.current = addSignalListener(signal, (error, response) => {
      setState({ error, data: response });
    });
  }, []);

  const stop = useCallback(() => {
    removeListener.current?.();
  }, []);

  return [state, { start, stop }];
};
