import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ContextMaster from './components/ContextMaster';
import { ContextMasterProvider } from './components/ContextMaster/context';

import './styles/globals.css';
import { Toaster } from './webview/components/ui/toaster';

function App() {
  return (
    <>
    <Toaster />
    <ContextMasterProvider>
      <ContextMaster />
    </ContextMasterProvider>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));