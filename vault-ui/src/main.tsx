import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import {Toaster} from 'react-hot-toast';
import {HCStyledProvider} from 'generic-components';
import {AuthProvider} from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HCStyledProvider>
            <AuthProvider>
                <App />
                <Toaster position={'bottom-left'} toastOptions={{duration: 5000, className: 'app-toast'}} />
            </AuthProvider>
        </HCStyledProvider>
    </React.StrictMode>
);
