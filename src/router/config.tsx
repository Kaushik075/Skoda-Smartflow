
import { RouteObject } from 'react-router-dom';
import { LoginPage } from '../pages/login/page';
import { DashboardPage } from '../pages/dashboard/page';
import { NotFound } from '../pages/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <LoginPage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/dashboard',
    element: <DashboardPage />
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
