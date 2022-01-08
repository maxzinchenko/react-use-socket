# React Awesome Web Socket

The package which makes web socket management much easier.<br>
The package is build over the <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket">WebSocket</a> constructor from browser API.

<a href="https://npmjs.com/package/react-awesome-socket" target="\_parent">
  <img alt="npm version" src="https://img.shields.io/npm/v/react-awesome-socket.svg" />
</a><a href="https://npmjs.com/package/react-awesome-socket" target="\_parent">
  <img alt="npm downloads" src="https://img.shields.io/npm/dm/react-awesome-socket.svg" />
</a>


---

## Structure

- [Installation](#Installation)
- [Provider options](#Provideroptions)
  - [url](#url)
  - [getRequestIndicator](#getRequestIndicator)
  - [getResponseIndicator](#getResponseIndicator)
  - [getError](#getError)
  - [autoConnect](#autoConnect)
  - [protocols](#protocols)
  - [shouldReconnect](#shouldReconnect)
  - [reconnectionIntervals](#reconnectionInterval)
  - [serialize](#serialize)
  - [deserialize](#deserialize)
  - [debug](#debug)
- [Hooks usage](#Hooks usage)
  - [useWebSocketState](#useWebSocketState)
  - [useSignal](#useSignal)
  - [useLazySignal](#useLazySignal)
  - [useSubscription](#useSubscription)
  - [useLazySubscription](#useLazySubscription)
- [Custom Error Type](#Custom Error Type)
- [Provider options declaration](#Provider options declaration)
  - [Passing own types to WebSocketOptions type](#Passing own types to WebSocketOptions type)


---


## Installation

```
# using npm
npm install react-awesome-websocket

# using yarn
yarn add react-awesome-websocket
```


---


## Provider options

`WebSocketOptions`

| Name                                              | Required | Type                                                | Default     |
| ------------------------------------------------- | -------- | --------------------------------------------------- | ----------- |
| [url](#url)                                       | Yes      | `string`                                            | -           |
| [getRequestIndicator](#getRequestIndicator)       | Yes      | `(req: Req) => string OR number`                    | -           |
| [getResponseIndicator](#getResponseIndicator)     | Yes      | `(res: Res) => string OR number`                    | -           |
| [getError](#getError)                             | Yes      | `(res: Res) => string OR Err OR null`       | -           |
| [autoConnect](#autoConnect)                       | No       | `boolean`                                           | `true`      |
| [protocols](#protocols)                           | No       | `string OR string[]`                                | -           |
| [shouldReconnect](#shouldReconnect)               | No       | `((event: CloseEvent) => boolean) OR boolean`       | `true`      |
| [reconnectionIntervals](#reconnectionInterval)    | No       | `number OR number[]`                                | `1000`      |
| [serialize](#serialize)                           | No       | `(req: Req) => SReq`                                | -           | 
| [deserialize](#deserialize)                       | No       | `(res: Res) => DRes`                                | -           |
| [debug](#debug)                                   | No       | `boolean`                                           | -           |

---

## url (required)

`string`

Url for the <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket">WebSocket</a> constructor.

```ts
url: 'ws://localhost:3000'
```

```ts
url: 'wss://example.com'
```

## getRequestIndicator (required)

`(res: Res) => string | number`

**WARNING:** Make sure that the `getRequestIndicator(req)` value indicator is exactly same as `getResponseIndicator(res)`.<br>
The package needs to know which the request received response belongs to.

Let us say that the request which needs to be sent to the API looks as:

**(this is just an example it's not a requirement to the API request type)**

```ts
req = {
  get_user: {
    id: 1
  }
}
```

The indicator is `get_user` so the prop should be:

```ts
getRequestIndicator: req => Object.keys(req)[0]
```

## getResponseIndicator (required)

`(res: Res) => string | number`

**WARNING:** Make sure that the `getResponseIndicator(res)` value indicator is exactly same as `getRequestIndicator(req)`.<br>
The package needs to know which the request received response belongs to.

Let us say that the response which comes from the API and needs to be handled looks as:<br>

**(this is just an example it's not a requirement to the API response type)**

```ts
res = {
  get_user: {
    id: 1,
    username: '@...',
    avatarUrl: 'https://...'
  }
}
```

The indicator is `get_user` so the prop should be:

```ts
getResponseIndicator: req => Object.keys(req)[0]
```

## getError (required)

`(res: Res) => string | Err | null`

Let us say that the failure response which comes from the API looks as:<br>

**(this is just an example it's not a requirement to the API response type)**

```ts
res = {
  get_user: {
    error: 'Not found'
  }
}
```

The error is `Not found` so the prop should be:

```ts
getError: res => res[Object.keys(req)[0]].error || null
```

When using custom error type `Err`:
(see doc of the [Custom error type](#Custom error type))
```ts
res = {
  get_user: {
    error: {
      message: 'Not found',
      meta: {...}
    }
  }
}
```

The error is an `object` so the prop should be:

```ts
getError: res => res[Object.keys(req)[0]].error || null
```

## autoConnect

`boolean` - (`true` by default)

When `true` you don't need to send anything to connect it.<br>
When `false` you need to connect the socket manually by using `useWebSocketState`.

```ts
autoConnect: true
```

## shouldReconnect

`((event: CloseEvent) => boolean) | boolean` - (`true` by default)

When `true` the socket tries to reconnect if `closeEvent.code !== 1001`.<br>
When the predicate is passed you are able to decide if the socket needs to be reconnected.

```ts
shouldReconnect: true
```

## debug

`boolean`

When `true` the package shows additional logs.

```ts
debug: ture
```

## protocols

`boolean`

Protocols for the <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket">WebSocket</a> constructor.

```ts
protocols: 'some protocol'
```

```ts
protocols: ['some protocol']
```

## reconnectionInterval

`number | number[]` - (`1000` by default)

<b>In milliseconds.</b><br>
When array each new connection uses the next number from the array for a timeout to avoid DDOSing a server.

```ts
reconnectionInterval: 1000
```

When reconnection count reaches the last array element it uses it each the next time.<br>
When the socket connects back the next reconnection loop will start from the `0` index.

```ts
reconnectionInterval: [0, 1000, 2000, 3000, 4000, 5000, 10000]
```

## serialize

`(req: Req) => SReq`<br>
`Req` and `SReq` are templates of the generic `MiddlewareOptions` type

The format function gets called to prepare the data to get submitted to the server. For example, `camelCase` to `snake_case` conversion.

```ts
serialize: req => {
  return {
    ...req,
    time: Date.now()
  }
}
```

## deserialize

`(res: Res) => DRes`<br>
`Res` and `DRes` are templates of the generic `MiddlewareOptions` type

The format function gets called to prepare the message to get submitted to the `onMessage` callback. For example, `snake_case` to `camelCase` conversion.

```ts
deserialize: res => {
  return res.data
}
```


---

## Custom Error Type

```ts
type Req = {
  get_user: {
    id: number
  }
}

type DRes = {
  get_user: {
    username: string
    avatarUrl: string
  }
}

type Error = {
  message: string
  meta: {
    timestamp: number
    service: string
    ...
  }
}
```

Putting these types into a generic hook:

```ts
const signalData = useSignal<Req, Res, Error>({...})
```

```ts
const [signalData, signalControls] = useLazySignal<Req, Res, Error>()
```

```ts
const [subscriptionData, subscriptionControls] = useSubscription<Req, Res, Error>('')
```

```ts
const [subscriptionData, subscriptionControls] = useLazySubscription<Req, Res, Error>('')
```


---


## Hooks usage

### useWebSocketState

```tsx
import React from 'react';
import { useWebSocketState } from 'react-awesome-websocket';

const Component = () => {
  const [connected, { open, close }] = useWebSocketState();

  return (
    <>
      <h1>useWebSocketState example</h1>
      <h2>Connected: {connected}</h2>
      <button onClick={open} disabled={connected}>Open</button>
      <button onClick={close} disabled={!connected}>Close</button>
    <>
  );
};
```

### useSignal

```tsx
import React from 'react';
import { useSignal } from 'react-awesome-websocket';

type Req = {
  get_user: {
    id: number
  }
}

type Res = {
  get_user: {
    username: string
    avatarUrl: string
  }
}

const Component = () => {
  const { loading, error, data, mounted } = useSignal<Req, Res>({
    get_user: { id: 1 }
  });

  return (
    <>
      <h1>useSignal example</h1>
      <h2>Loading: {loading}</h2>
      <h2>Error: {error}</h2>
      <h2>Mounted: {mounted}</h2>
      <h2>Data:</h2>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    <>
  );
};
```

### useLazySignal

```tsx
import React from 'react';
import { useLazySignal } from 'react-awesome-websocket';

type Req = {
  get_user: {
    id: number
  }
}

type DRes = {
  get_user: {
    username: string
    avatarUrl: string
  }
}

const Component = () => {
  const [signalData, { send }] = useLazySignal<Req, DRes>({
    get_user: { id: 1 }
  });

  const { loading, error, data, mounted } = signalData;
  
  const handleSendClick = () => {
    send({ get_user: { id: 1 } });
  }

  return (
    <>
      <h1>useLazySignal example</h1>
      <button onClick={handleSendClick}>Send Request</button>
      <h2>Loading: {loading}</h2>
      <h2>Error:</h2>
      <pre>{JSON.stringify(error, null, 4)}</pre>
      <h2>Mounted: {mounted}</h2>
      <h2>Data:</h2>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    <>
  );
};
```

### useSubscription

```tsx
import React from 'react';
import { useSubscription } from 'react-awesome-websocket';

type DRes = {
  user_update: {
    username: string
    avatarUrl: string
  }
}

const Component = () => {
  const [{ data, error }, { stop }] = useSubscription<DRes>('user_update');

  return (
    <>
      <h1>useSubscription example</h1>
      <button onClick={stop}>Stop subscription</button>
      <h2>Error: {error}</h2>
      <h2>Data:</h2>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    <>
  );
};
```

### useLazySubscription

```tsx
import React from 'react';
import { useLazySubscription } from 'react-awesome-websocket';

type Req = {
  get_user: {
    id: number
  }
}

type DRes = {
  get_user: {
    username: string
    avatarUrl: string
  }
}

const Component = () => {
  const [{ data, error }, { start, stop }] = useLazySubscription<DRes>('user_update');

  return (
    <>
      <h1>useLazySubscription example</h1>
      <button onClick={start}>Start subscription</button>
      <button onClick={stop}>Stop subscription</button>
      <h2>Error: {error}</h2>
      <h2>Data:</h2>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    <>
  );
};
```

---

## Provider options declaration

```ts
import { WebSocketOptions } from 'react-awesome-websocket';

type ScoketReq = {
  method: string
  data: Record<string, unknown>
};

type SocketRes = {
  [method: string]: Record<string, unknown>
};

type ScoketSerializedReq = {
  [method: string]: Record<string, unknown>
};

type SocketDeserializedRes = Record<string, unknown>;

type SocketError = {
  message: string
  meta: {}
};

const options: WebSocketOptions<
  ScoketReq,
  SocketRes,
  SocketError,
  ScoketSerializedReq,
  SocketDeserializedRes
> = {
  url: 'ws://localhost:3000',
  getRequestIndicator: req => req.method,
  getResponseIndicator: res => Object.keys(res)[0],
  getError: res => res[Object.keys(res)[0]].error_msg || null,

  // serialize: (req: ScoketReq) => ScoketSerializedReq
  serialize: ({ method, data }) => ({ [method]: data }),

  // deserialize: (res: SocketRes) => SocketDeserializedRes
  deserialize: (res: SocketRes) => res[Object.keys(res)[0]]
};
```

### Passing own types to WebSocketOptions type
`ProviderOptions` is a generic type.

```ts
ProviderOptions<Req, Res, Err = string, SReq = Req, DRes = Res>
```

`Req` - type of the socket request (required).

`Res` - type of the socket response (required).

`Err` (default is `string`) - type of the socket error which is reachable by using hooks as` error` (not required).

`SReq` (default is `Req`) - type of serialized socket request which will be sent to the API (not required).<br>
**This type should be returned from the ProviderOptions.serialize function.**

`DRes` (default is `Res`) - type of deserialized socket response which is reachable by using hooks as `data` (not required).<br>
**This type should be returned from the ProviderOptions.deserialize function.**
