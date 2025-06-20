import * as React from 'react';
import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {RouterProvider} from 'react-router-dom';
import router from './routes/Routes';
import {useEffect} from 'react';
import t, {useToaster} from 'react-hot-toast';
import {getCurrentUser, logout} from './services/auth/Auth.service';

function App() {
    const [toastLimit] = React.useState(3);
    const {toasts} = useToaster();

    useEffect(() => {
        window.addEventListener('unload', handleTabClosing);

        return () => {
            window.removeEventListener('unload', handleTabClosing);
        };
    });

    const handleTabClosing = () => {
        const user = getCurrentUser();
        if (!user) logout();
    };

    React.useEffect(() => {
        toasts
            .filter((tt) => tt.visible)
            .filter((_, i) => i >= toastLimit)
            .forEach((tt) => t.dismiss(tt.id));
    }, [toastLimit, toasts]);

    return (
        <RouterProvider router={router} />
    );
}

export default App;
