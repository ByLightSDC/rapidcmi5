import * as yup from 'yup';
import { REQUIRED_ERROR } from '../validationTypes';

/** @constant
 * clusterNetworkLabelSubdomainRegex
 * Regex to validate the optional subdomain prefix of the Cluster Network Label key
 * The subdomain consists of a series of DNS labels separated by .
 *
 * Example: rangeos.cloudcents.bylight.com/clusterRangeNetworkType   (the part BEFORE the slash)
 *  @type {RegExp}
 */
const clusterNetworkLabelSubdomainRegex = /^(([a-zA-Z]+[.])*[a-zA-Z]+)$/; // alphanumeric label(s) separated by '.'
const maxClusterNetworkLabelSubdomainLength = 253;

/**
 * @constant
 * clusterNetworkLabelNameRegex
 * Regex to validate the "name" portion of the Label key (after optional subdomain prefix)
 * as well as the label value
 *
 * Examples:
 *    Key:   rangeos.cloudcents.bylight.com/clusterRangeNetworkType (the part AFTER the slash)
 *            rangeos.cloudcents.bylight.com  (no prefix - the whole thing)
 *    Value:  internet
 *  @type {RegExp}
 */
const clusterNetworkLabelNameRegex =
  /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
const clusterNetworklabelConstraintsMsg =
  'Can include alpha-numeric or -._ but must start AND end  with alpha-numeric ONLY.';
const maxClusterNetworkLabelNameLength = 63;

/**
 * @constant
 * CLUSTER_NETWORK_LABEL_KEY_GROUP
 * Yup validation for the Cluster Network Label key
 *
 * Examples:
 *   rangeos.cloudcents.bylight.com/clusterRangeNetworkType  (key with optional subdomain prefix)
 *   rangeos.cloudcents.bylight.com (key with no subdomain prefix)
 * @type {yup schema}
 */
export const CLUSTER_NETWORK_LABEL_KEY_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .test(
    'is-valid-cluster-network-label-key',
    'dummy message',
    function (value, validationContext) {
      const { createError } = validationContext;
      const keyValue = value || '';
      const lastSlashIndex = keyValue.lastIndexOf('/');
      const nameValue = keyValue.substring(lastSlashIndex + 1);
      if (lastSlashIndex > -1) {
        const subdomainValue = keyValue.substring(0, lastSlashIndex);
        if (!clusterNetworkLabelSubdomainRegex.test(subdomainValue)) {
          return createError({
            message:
              'Invalid DNS subdomain prefix. Must be lower-case alpha-numeric strings separated by .',
          });
        }
        if (subdomainValue.length > maxClusterNetworkLabelSubdomainLength) {
          return createError({
            message: `DNS subdomain prefix has a ${maxClusterNetworkLabelSubdomainLength} character limit`,
          });
        }
        if (nameValue.length === 0) {
          return createError({
            message: 'Label name is required after DNS subdomain prefix',
          });
        }
      }
      if (!clusterNetworkLabelNameRegex.test(nameValue)) {
        return createError({
          message: `Invalid label name (after optional subdomain). ${clusterNetworklabelConstraintsMsg}`,
        });
      }
      if (nameValue.length > maxClusterNetworkLabelNameLength) {
        return createError({
          message: `Label name (after optional subdomain) has a ${maxClusterNetworkLabelNameLength} character limit`,
        });
      }
      return true;
    },
  );

/**
 * @constant
 * CLUSTER_NETWORK_LABEL_VALUE_GROUP
 * Yup validation for the Cluster Network Label value
 *
 * Example: internet
 * @type {yup schema}
 */
export const CLUSTER_NETWORK_LABEL_VALUE_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .test(
    'is-valid-cluster-network-label-value',
    'dummy message',
    function (value, validationContext) {
      const labelValue = value || '';
      const { createError } = validationContext;
      if (!clusterNetworkLabelNameRegex.test(labelValue)) {
        return createError({
          message: `Invalid label value. ${clusterNetworklabelConstraintsMsg}`,
        });
      }
      if (labelValue.length > maxClusterNetworkLabelNameLength) {
        return createError({
          message: `There is a ${maxClusterNetworkLabelNameLength} character limit`,
        });
      }
      return true;
    },
  );
