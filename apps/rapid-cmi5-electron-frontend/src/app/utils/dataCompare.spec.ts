import { hasDataChanged } from './dataCompare';

describe('hasDataChanged', () => {
  const compareProps = ['name', 'description', 'time', 'shared'];
  const object1 = {
    name: 'name1',
    description: 'description 1',
    time: 24,
    shared: false,
    nonFormField: 'ignore',
  };
  const object2Unchanged = {
    name: 'name1',
    description: 'description 1',
    time: 24,
    shared: false,
    nonFormField: 'ignore',
  };

  it('should return false if object has not changed', () => {
    const changed = hasDataChanged(object1, object2Unchanged, compareProps);
    expect(changed).toEqual(false);
  });

  it('should return false if object1 is undefined', () => {
    const changed = hasDataChanged(undefined, object2Unchanged, compareProps);
    expect(changed).toEqual(false);
  });

  it('should return false if object2 is undefined', () => {
    const changed = hasDataChanged(object1, undefined, compareProps);
    expect(changed).toEqual(false);
  });

  it('should return true if string field in object has changed', () => {
    const object2StringChanged = {
      name: 'name1',
      description: 'description updated',
      time: 24,
      shared: false,
      nonFormField: 'ignore',
    };
    const changed = hasDataChanged(object1, object2StringChanged, compareProps);
    expect(changed).toEqual(true);
  });

  it('should return true if number field in object has changed', () => {
    const object2NumberChanged = {
      name: 'name1',
      description: 'description 1',
      time: 36,
      shared: false,
      nonFormField: 'ignore',
    };
    const changed = hasDataChanged(object1, object2NumberChanged, compareProps);
    expect(changed).toEqual(true);
  });

  it('should return true if boolean field in object has changed', () => {
    const object2BooleanChanged = {
      name: 'name1',
      description: 'description 1',
      time: 24,
      shared: true,
      nonFormField: 'ignore',
    };
    const changed = hasDataChanged(
      object1,
      object2BooleanChanged,
      compareProps,
    );
    expect(changed).toEqual(true);
  });

  it('should return false if only ignored field has changed', () => {
    const object2IgnoredFieldChanged = {
      name: 'name1',
      description: 'description 1',
      time: 24,
      shared: false,
      nonFormField: 'changed',
    };
    const changed = hasDataChanged(
      object1,
      object2IgnoredFieldChanged,
      compareProps,
    );
    expect(changed).toEqual(false);
  });

  it('should return true if data field does not exist in both objects', () => {
    const object2DifferentcompareProps = {
      name: 'name1',
      description: 'description 1',
      otherTime: 24,
      shared: false,
      nonFormField: 'ignore',
    };
    const changed = hasDataChanged(object1, object2DifferentcompareProps);
    expect(changed).toEqual(true);
  });
});
