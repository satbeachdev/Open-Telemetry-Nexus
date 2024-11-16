import React from 'react';
import ReactDOM from 'react-dom/client';
import './app.css';
import App from './App';
//import { AddOpenTelemetry } from "./addOpenTelemetry";

//AddOpenTelemetry("ot-nexus");

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);