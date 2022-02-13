import React from 'react';
import { NavLink, BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';

import { OneSocket } from './one-socket';
import { ManySockets } from './many-sockets';


export const Nav = () => (
  <>
    <ul>
      <li>
        <NavLink to="/one-socket">One-socket implementation</NavLink>
      </li>
      <li>
        <NavLink to="/many-sockets">Many-sockets implementation</NavLink>
      </li>
    </ul>

    <Outlet />
  </>
);


export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Nav />}>
        <Route path="one-socket" element={<OneSocket />} />
        <Route path="many-sockets" element={<ManySockets />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
