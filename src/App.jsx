import { Provider } from 'react-redux';
import { store } from './store/store';
import publicRoutes, { PublicRoute } from './routes/publicRoutes';
import privateRoutes, { PrivateRoute } from './routes/privateRoutes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
	return (
		<Provider store={store}>
			<RouterProvider router={router} />
			<ToastContainer
				position='top-right'
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
		</Provider>
	);
}

export default App;
