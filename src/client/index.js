import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App'

let focusRef = React.createRef();
let onFocus = () => {
  focusRef.current?.focus({cursor: 'all'});
};
window.addEventListener('focus', onFocus);
ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <App focusRef={focusRef} /> 
  </>
);
