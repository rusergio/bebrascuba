import { Outlet, useLocation, useMatches } from 'react-router-dom';
import classes from '../styles/animations.module.css';

type RouteHandle = {
  isNotFound?: boolean;
};

export function AnimatedOutlet() {
  const location = useLocation();
  const isNotFound = useMatches().some((match) => (match.handle as RouteHandle | undefined)?.isNotFound);

  if (isNotFound) {
    return <Outlet />;
  }

  return (
    <div key={location.pathname} className={classes.pageEnter}>
      <Outlet />
    </div>
  );
}
