/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable array-callback-return */

// using name / value because rendering a field named "key" causes problem with focus
export type tKeyValuePair = {
  name: string;
  value: string;
};

export const defaultKeyValuePair = {
  name: '',
  value: '',
};

/**
 * Returns cloned payload with values populated from the source
 * @param {any} sourceData Values to pull from
 * @param {any} payloadTemplate Properties to model in payload
 * @return {any} Payload
 */
export const sanitizePayload = (sourceData: any, payloadTemplate: any): any => {
  const payload = { ...payloadTemplate };
  Object.keys(payload).map((key) => {
    if (Object.prototype.hasOwnProperty.call(sourceData, key)) {
      payload[key] = sourceData[key];
    }
  });
  return payload;
};

/**
 * Returns payload representing the difference between two objects
 * Payload is used as the model for which properties should be included
 * @param {any} sourceData Source Values used to diff
 * @param {any} payload Payload to sanitize
 * @return {any} Payload
 */
export const diffPayload = (sourceData: any, payload: any): any => {
  const diff: any = {};
  Object.keys(payload).map((key) => {
    if (Object.prototype.hasOwnProperty.call(sourceData, key)) {
      if (sourceData[key] !== payload[key]) {
        if (typeof payload[key] === 'object' && payload[key] !== null) {
          //if any nested prop is different
          //return the parent property and entire object
          const isDifferent = check(sourceData[key], payload[key]);
          if (isDifferent) {
            diff[key] = payload[key];
          }
        } else {
          diff[key] = payload[key];
        }
      }
    } else {
      diff[key] = payload[key];
    }
  });
  return diff;
};

const check = (a: any, b: any): any => {
  const kk = Object.keys(b);
  for (let i = 0; i < kk.length; i++) {
    const key = kk[i];
    if (Object.prototype.hasOwnProperty.call(a, key)) {
      if (a[key] !== b[key]) {
        if (typeof b[key] === 'object' && b[key] !== null) {
          //if any nested prop is different
          if (Array.isArray(b[key])) {
            if (Array.isArray(a[key])) {
              if (a[key].length === b[key].length) {
                let isArrayDiff = false;
                for (let j = 0; j < b[key].length; j++) {
                  isArrayDiff = check(a[key][j], b[key][j]);
                  if (isArrayDiff) {
                    return true;
                  }
                }
              } else {
                return true;
              }
            } else {
              return true;
            }
          } else {
            return check(a[key], b[key]);
          }
        } else {
          return true;
        }
      }
    } else {
      return true;
    }
  }
  return false;
};

//convert array of key(name) value pair objects to an object where each property is a key(name) from the input array
export const condenseKeyValue = (
  sourceProp: string,
  destProp: string,
  sourceData: any,
): any => {
  if (Object.prototype.hasOwnProperty.call(sourceData, sourceProp)) {
    const newData: LooseObject = {};

    sourceData[sourceProp].map((pair: tKeyValuePair) => {
      newData[pair.name] = pair.value;
    });
    sourceData[destProp] = newData;
  }
  return sourceData;
};

//convert object keys to an array of key(name) value pairs
export const expandKeyValue = (
  sourceProp: string,
  destProp: string,
  sourceData: any,
  destData?: any,
): any => {
  if (!destData) {
    destData = sourceData;
  }
  if (Object.prototype.hasOwnProperty.call(sourceData, sourceProp)) {
    const newData: tKeyValuePair[] = [];
    if (sourceData[sourceProp] !== null) {
      Object.keys(sourceData[sourceProp]).map((key) => {
        newData.push({ name: key, value: sourceData[sourceProp][key] });
      });
    }
    destData[destProp] = newData;
  }
  return destData;
};

export interface LooseObject {
  [key: string]: any;
}

export const getLooseProp = (source: any, prop: string, defaultVal: string) => {
  if (!source) {
    return '';
  }

  if (Object.prototype.hasOwnProperty.call(source, prop)) {
    return source[prop];
  }

  return defaultVal;
};

// remove any "empty" values so they won't be passed to api
export const removeEmptyValues = (values?: LooseObject) => {
  // recursively loop over entries - removing any empty ones
  const cleanObject = (object: any) => {
    Object.entries(object).forEach(([k, value]) => {
      if (value && typeof value === 'object') {
        cleanObject(value); // so that we remove any empty children - in case that makes this item empty as well
      }
      // now handle - empty object type OR individual field
      if (
        (value && typeof value === 'object' && !Object.keys(value).length) ||
        value === null ||
        value === undefined ||
        (value as any)?.length === 0 // any - to handle string or array
      ) {
        if (Array.isArray(object)) {
          const index = Number(k);
          object.splice(index, 1);
        } else {
          delete object[k];
        }
      }
    });
    return object;
  };

  if (values) {
    const newValues = { ...values };
    cleanObject(newValues);
    return newValues;
  }
  return {};
};
