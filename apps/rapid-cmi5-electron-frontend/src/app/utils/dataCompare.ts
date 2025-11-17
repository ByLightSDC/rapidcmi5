/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* compare given field(s) of two versions of an object to see if anything has changed
 *   object1: initial object ('truth')
 *   object2: current object
 *   compareProps: optional list constraining comparison to only these fields
 */
export function hasDataChanged(
  object1: any,
  object2: any,
  compareProps?: string[],
) {
  if (!object1 || !object2) {
    //Attempted to compare undefined object(s)
    return false;
  }

  let properties = compareProps || [];

  if (!compareProps) {
    const object1Keys = Object.keys(object1);
    const object2Keys = Object.keys(object2);
    // make sure properties are all the same
    if (
      object1Keys.length === object2Keys.length &&
      object1Keys.every((value) => ~object2Keys.indexOf(value))
    ) {
      properties = object1Keys;
    } else {
      return true;
    }
  }

  for (let i = 0; i < properties.length; i++) {
    if (
      !object1.hasOwnProperty(properties[i]) ||
      !object2.hasOwnProperty(properties[i])
    ) {
      return true;
    }
    if (object1[properties[i]] !== object2[properties[i]]) {
      return true;
    }
  }
  return false;
}
