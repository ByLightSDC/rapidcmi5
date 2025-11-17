/*
 * Tests for utility functions
 */

import { removeEmptyValues } from './utility';

describe('removeEmptyValues', () => {
  it('should return only nonempty fields', () => {
    const initialValues = {
      myString: 'xx',
      emptyString: '',
      myObject: {
        nullNumber: null,
        number: 6,
        nestedString: 'xyz',
        nestedEmptyString: '',
      },
      myEmptyObject: {},
      myEmptiedObject: {
        nestedEmptyValue: '',
      },
      myArray: ['x', null, 'y'],
    };

    const expectedResult = {
      myString: 'xx',
      myObject: {
        number: 6,
        nestedString: 'xyz',
      },
      myArray: ['x', 'y'],
    };

    const result = removeEmptyValues(initialValues);
    expect(result).toBeDefined();
    expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedResult));
  });

  it('should return an empty object if all values are empty', () => {
    const initialValues = {
      emptyString: '',
      emptyObject: {
        nullNumber: null,
      },
    };

    const result = removeEmptyValues(initialValues);
    expect(result).toBeDefined();
    expect(JSON.stringify(result)).toEqual('{}');
  });

  it('should return an empty object if input values is NOT defined', () => {
    const result = removeEmptyValues();
    expect(result).toBeDefined();
    expect(JSON.stringify(result)).toEqual('{}');
  });
});
