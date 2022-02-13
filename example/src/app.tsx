import React from 'react';
import { WebSocketProvider, WebSocketOptions, useWebSocketState, useSignal, useLazySignal, useSubscription, useLazySubscription } from 'react-use-socket';

type Req = {
  method: string
  data: Record<string, any>
}

type Res = {
  [method: string]: Record<string, any>
}

type SerializedReq = {
  [method: string]: Record<string, any>
}

type DeserializedRes = Record<string, any>;

const options: WebSocketOptions<Req, Res, string, SerializedReq, DeserializedRes> = {
  // Using "wss://echo.websocket.events" for an example.
  // This service just sends back the signals it receives.
  url: 'wss://echo.websocket.events',
  getRequestIndicator: req => req.method,
  getResponseIndicator: res => Object.keys(res)[0],
  getError: res => res[Object.keys(res)[0]].error || null,

  debug: true,

  serialize: req => ({ [req.method]: req.data }),
  deserialize: res => res[Object.keys(res)[0]]
}

const WebSocketState = () => {
  const [connected, { close, open }] = useWebSocketState();

  return (
    <div>
      <h2>useWebSocket</h2>
      <h3>Connected: {connected ? 'Yes' : 'No'}</h3>

      <button onClick={open} disabled={connected}>Open Connection</button>
      <button onClick={() => close()} disabled={!connected}>Close Connection</button>
    </div>
  );
}

const Signal = () => {
  const data = useSignal<Req, DeserializedRes>({ method: 'get_data', data: { some: 'some' } });
  const dataWithError = useSignal<Req, DeserializedRes>({ method: 'get_user', data: { some: 'some', error: 'something went wrong' } });

  return (
    <div>
      <h2>useSignal</h2>

      <p>When success:</p>
      <pre>{JSON.stringify(data, null, 4)}</pre>
      <br/>
      <p>When error:</p>
      <pre>{JSON.stringify(dataWithError, null, 4)}</pre>
    </div>
  );
}

const LazySignal = () => {
  const [connected] = useWebSocketState();
  const [data, { send }] = useLazySignal<Req, DeserializedRes>();
  const [dataWithError, { send: sendWithError }] = useLazySignal<Req, DeserializedRes>();

  const handleSendClick = () => {
    if (!connected) return;

    send({ method: 'get_data', data: { some: 'some' } });
  }

  const handleSendWithErrorClick = () => {
    if (!connected) return;

    sendWithError({ method: 'get_data', data: { some: 'some', error: 'something went wrong' } });
  }

  return (
    <div>
      <h2>useLazySignal</h2>

      <p>When success:</p>
      <button onClick={handleSendClick} disabled={!connected}>
        Send
      </button>
      <pre>{JSON.stringify(data, null, 4)}</pre>
      <br/>
      <p>When error:</p>
      <button onClick={handleSendWithErrorClick} disabled={!connected}>
        Send
      </button>
      <pre>{JSON.stringify(dataWithError, null, 4)}</pre>
    </div>
  );
}

const Subscription = () => {
  const [data, { stop }]  = useSubscription<Req, DeserializedRes>('get_user');

  return (
    <div>
      <h2>useSubscription</h2>

      <button onClick={stop}>
        Stop receiving updates
      </button>
      <p>Raw data:</p>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </div>
  );
}

const LazySubscription = () => {
  const [data, { start, stop }]  = useLazySubscription<Req, DeserializedRes>('get_user');

  return (
    <div>
      <h2>useLazySubscription</h2>

      <button onClick={start}>
        Start receiving updates
      </button>
      <button onClick={stop}>
        Stop receiving updates
      </button>
      <p>Raw data:</p>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </div>
  );
}

export const App = () => {
  return (
    <WebSocketProvider options={options}>
      <h1>react-use-socket examples</h1>
      <br/>
      <WebSocketState />
      <br/>
      <Signal />
      <br/>
      <LazySignal />
      <br/>
      <Subscription />
      <br/>
      <LazySubscription />
    </WebSocketProvider>
  );
}
