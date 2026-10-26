import { useSyncExternalStore } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from './store/store';
import { queryClient } from './lib/query-client';
import { isDarkTheme, subscribeToTheme } from './lib/theme';
import publicRoutes, { PublicRoute } from './routes/publicRoutes';
import privateRoutes, { PrivateRoute } from './routes/privateRoutes';

const router = createBrowserRouter([
	{
		path: '/',
		element: <PublicRoute />,
		children: publicRoutes,
	},
	{
		path: '/',
		element: <PrivateRoute />,
		children: privateRoutes,
	},
]);

function App() {
	// los avisos siguen el tema aplicado (también cuando el usuario lo elige a mano)
	const dark = useSyncExternalStore(subscribeToTheme, isDarkTheme);

	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
				<Toaster
					theme={dark ? 'dark' : 'light'}
					position="top-right"
					richColors
					closeButton
					toastOptions={{ duration: 4000, classNames: { toast: 'font-sans text-[15px]' } }}
				/>
			</QueryClientProvider>
		</Provider>
	);
}

export default App;
