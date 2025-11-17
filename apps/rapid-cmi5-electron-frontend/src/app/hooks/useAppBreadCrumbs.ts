import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { commonIds } from '@rangeos-nx/ui/redux';
import { BreadCrumb } from '../types/breadCrumb';
import {
  deployEnvironmentNavId,
  deployRangeNavId,
  environmentsNavId,
} from '../utils/constants';
import { isValidUUID, startsWithNumber } from '@rangeos-nx/ui/validation';

/* Custom Breadcrumbs for this App */
export const useAppBreadCrumbs = () => {
  const commonIdsSel = useSelector(commonIds);
  const location = useLocation();
  const crumbs: BreadCrumb[] = [];

  /** @constant
   * List of routes to exclude from hyperlinking breadcrub
   *  @type {RegExp[]}
   */
  const urlExclusions = [
    new RegExp('/manage_ranges/[^/]+/[^/]+/consoles/[^/]+$'),
  ];

  /**
   * Checks to see if a breadcrumb path should have a hyperlink
   * @param {string} url Breadcrumb route
   * @return {boolean} Whether crumb should NOT have hyperlink
   */
  const getIsExcluded = (url: string): boolean => {
    for (let i = 0; i < urlExclusions.length; i++) {
      if (urlExclusions[i].test(url)) {
        return true;
      }
    }
    return false;
  };

  if (location.pathname.includes(deployRangeNavId)) {
    crumbs.push({ label: 'Deploy Range' });
  } else if (location.pathname.includes(deployEnvironmentNavId)) {
    const url = '/' + environmentsNavId;
    crumbs.push({ label: 'Environments', url: url });
    crumbs.push({ label: 'Deploy Environment' });
  }
  // no breadcrumbs if just at top level "home"
  else if (location.pathname !== '/') {
    //Replace kebab chars with spaces
    const paths = location.pathname.replace(/_/g, ' ').split('/').slice(1);

    let itemLabel = '';

    paths.forEach((item, index) => {
      //Alias for uuids
      if (startsWithNumber(item) || isValidUUID(item)) {
        const alias = commonIdsSel.find((element) => element.id === item);
        if (alias) {
          itemLabel = alias.name;
        } else {
          itemLabel = item;
        }
      } else {
        itemLabel = item;
      }

      if (index < paths.length - 1) {
        const url =
          '/' +
          paths
            .slice(0, index + 1)
            .join('/')
            .replace(/ /g, '_');

        //Determine whether crumb should be hyperlinked
        if (!getIsExcluded(url)) {
          crumbs.push({ label: itemLabel, url: url });
        } else {
          crumbs.push({ label: itemLabel });
        }
      } else {
        crumbs.push({ label: itemLabel });
      }
    });
  }
  return crumbs;
};
