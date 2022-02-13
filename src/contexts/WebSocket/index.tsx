import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';

import { Context, ProviderProps, ConnectedState, ContextExtended, WebSockets, Options } from './typedef';
import { WebSocketService } from '../../services/WebSocket';


const WebSocketContext = createContext<Context>({} as Context);


export const WebSocketProvider = <
  Req,
  Res,
  N extends string = string,
  Err = string,
  SReq = Req,
  DRes = Res
>({ options, children }: ProviderProps<Req, Res, N, Err, SReq, DRes>) => {
  const [connected, setConnected] = useState<ConnectedState<N> | {}>({});

  const optionsEntries = useMemo((): [N, Options<Req, Res, N, Err, SReq, DRes>][] => {
    return Object.entries(options) as any[];
  }, [options]);

  const handleOpen = useCallback((name: N) => {
    setConnected(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleClose = useCallback((name: N) => {
    setConnected(prev => ({ ...prev, [name]: false }));
  }, []);

  const webSockets = useMemo(() => {
    // eslint-disable-next-line unicorn/no-reduce
    return optionsEntries.reduce((acc, [name, wsOptions]) => {
      const onOpen = () => handleOpen(name);
      const onClose = () => handleClose(name);

      return { ...acc, [name]: new WebSocketService({ name, ...wsOptions }, onOpen, onClose) };
    }, {} as WebSockets<Req, Res, N, Err, SReq, DRes>);
  }, [!optionsEntries.length]);

  useEffect(() => {
    if (optionsEntries.length !== Object.values(webSockets).length) return;

    optionsEntries.map(([name, wsOptions]) => {
      // This "false" check is required here since the value can be "undefined".
      // The socket needs to be connected when "undefined".
      if (wsOptions.autoConnect === false) return;

      webSockets[name].open();
    });
  }, [Object.values(webSockets).length]);

  return (
    <WebSocketContext.Provider value={{ connected, webSockets, options }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = <Req, Res, N extends string = string, Err = string>(name?: N): ContextExtended<Req, Res, Err> => {
  const context = useContext(WebSocketContext as React.Context<Context<Req, Res, N, Err>>);

  if (!context) throw new Error('WebSocket context not found. Make sure you use hooks inside a <WebSocketProvider>');

  const multiply = Object.keys(context.options).length > 1;
  if (multiply && !name) throw new Error('The "name" is required for the hook usage');

  const webSocketName = (multiply ? name : Object.keys(context.options)[0]) as N;
  const { webSockets, options, connected } = context;

  return {
    ...webSockets[webSocketName],
    connected: connected[webSocketName],
    getRequestIndicator: options[webSocketName].getRequestIndicator
  };
};
