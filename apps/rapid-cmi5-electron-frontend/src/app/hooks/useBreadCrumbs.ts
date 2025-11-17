import { useLocation } from 'react-router';
import { BreadCrumb } from '../types/breadCrumb';

export const useBreadCrumbs = () => {
  const location = useLocation();

  const crumbs: BreadCrumb[] = [];
  // no breadcrumbs if just at top level "home"
  if (location.pathname !== '/') {
    //Replace kebab chars with spaces
    const paths = location.pathname.replace(/_/g, ' ').split('/').slice(1);

    paths.forEach((item, index) => {
      if (index < paths.length - 1) {
        const url = '/' + paths.slice(0, index + 1).join('/');
        crumbs.push({ label: item, url: url });
      } else {
        crumbs.push({ label: item });
      }
    });
  }
  return crumbs;
};
