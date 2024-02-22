import React from 'react'
import { createRef } from "react";
import { createRoot } from "react-dom/client";
import App from './App'
import './main.css'

const root = createRoot(document.querySelector('#root'));
 
root.render(
  <>
    <App />
  </>
)
