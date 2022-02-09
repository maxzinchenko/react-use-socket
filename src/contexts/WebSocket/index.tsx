import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { Context, ProviderProps } from './typedef';
import { WebSocketService } from '../../services/WebSocket';


const WebSocketContext = createContext<Context>({} as Context);


export const WebSocketProvider = <
  Req,
  Res,
  Err = string,
  SReq = Req,
  DRes = Res
>({ options, children }: ProviderProps<Req, Res, Err, SReq, DRes>) => {
  const [connected, setConnected] = useState(false);

  const handleOpen = useCallback(() => {
    setConnected(true);
  }, []);

  const handleClose = useCallback(() => {
    setConnected(false);
  }, []);

  const webSocket = useRef(new WebSocketService<Req, Res, Err, SReq, DRes>(options, handleOpen, handleClose)).current;

  useEffect(() => {
    // This "false" check is required here since the value can be "undefined".
    // The socket needs to be connected when "undefined".
    if (options.autoConnect === false) return;

    webSocket.open();
  }, []);

  const open = useCallback(webSocket.open, []);
  const send = useCallback(webSocket.send, []);
  const close = useCallback(webSocket.close, []);
  const addSignalListener = useCallback(webSocket.addSignalListener, []);
  const removeSignalListener = useCallback(webSocket.removeSignalListener, []);

  return (
    <WebSocketContext.Provider value={{
      connected,
      open,
      send,
      close,
      addSignalListener,
      removeSignalListener,
      getRequestIndicator: options.getRequestIndicator,
      debug: options.debug
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = <Req, Res, Err = string>() => {
  const context = useContext(WebSocketContext as React.Context<Context<Req, Res, Err>>);

  if (!context) throw new Error('WebSocket context not found. Make sure you use hooks inside a <WebSocketProvider>');

  return context;
};
