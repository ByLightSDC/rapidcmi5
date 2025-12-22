/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as yup from 'yup';

import {
  CERTIFICATE_SUBJECT_GROUP,
  DNS_RECORD_NAME_GROUP,
  DNS_RECORD_DATA_GROUP,
  ENUM_GROUP,
  UUID_BASE,
  UUID_GROUP_OPTIONS,
  UUID_ONLY_ONE_FROM_GROUP,
  getIntegerWithUnitsValidation,
  getOptIntegerWithUnitsValidation,
  RESOURCE_QUANTITY_WITH_MINIMUM_GROUP,
} from '@rapid-cmi5/ui';

describe('CERTIFICATE_SUBJECT_GROUP validates', () => {
  const schema = yup.object().shape({
    field: CERTIFICATE_SUBJECT_GROUP,
  });
  it('should fail for null field', async () => {
    const result = await schema.isValid({});
    expect(result).toEqual(false);
  });
  it('should fail for empty field', async () => {
    const result = await schema.isValid({ field: {} });
    expect(result).toEqual(false);
  });
  it('should pass if country filled in', async () => {
    const result = await schema.isValid({ field: { c: 'US' } });
    expect(result).toEqual(true);
  });
  it('should pass if state filled in', async () => {
    const result = await schema.isValid({ field: { sT: 'my state' } });
    expect(result).toEqual(true);
  });
  it('should pass if locality filled in', async () => {
    const result = await schema.isValid({ field: { l: 'my home town' } });
    expect(result).toEqual(true);
  });
  it('should pass if organization filled in', async () => {
    const result = await schema.isValid({ field: { o: 'my organization' } });
    expect(result).toEqual(true);
  });
  it('should pass if organizational unit filled in', async () => {
    const result = await schema.isValid({ field: { oU: 'my team' } });
    expect(result).toEqual(true);
  });
  it('should pass if all fields filled in', async () => {
    const result = await schema.isValid({
      field: {
        c: 'US',
        sT: 'my state',
        l: 'my home town',
        o: 'my organization',
        oU: 'my team',
      },
    });
    expect(result).toEqual(true);
  });
});

describe('DNS_RECORD_NAME_GROUP validates', () => {
  const schema = yup.object().shape({
    field: DNS_RECORD_NAME_GROUP,
  });

  it('should pass for word with no spaces', async () => {
    const result = await schema.isValid({ field: 'validName' });
    expect(result).toEqual(true);
  });
  it('should pass for quoted string', async () => {
    const result = await schema.isValid({ field: '"valid quoted name"' });
    expect(result).toEqual(true);
  });
  it('should pass for quoted string with escaped quote', async () => {
    const result = await schema.isValid({ field: '"valid \\"quoted\\" name"' });
    expect(result).toEqual(true);
  });

  it('should fail for empty string - required field', async () => {
    const result = await schema.isValid({ field: '' });
    expect(result).toEqual(false);
  });
  it('should fail for string with space(s)', async () => {
    const result = await schema.isValid({ field: 'invalid name' });
    expect(result).toEqual(false);
  });
  it('should fail for string with "newline"', async () => {
    const result = await schema.isValid({ field: 'invalid\nname' });
    expect(result).toEqual(false);
  });
  it('should fail for quoted string with internal unescaped quote', async () => {
    const result = await schema.isValid({ field: '"invalid "quoted" name"' });
    expect(result).toEqual(false);
  });
  it('should fail for string longer than max characters', async () => {
    const result = await schema.isValid({
      field:
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
    });
    expect(result).toEqual(false);
  });
});

describe('DNS_RECORD_DATA_GROUP validates', () => {
  const schema = yup.object().shape({
    data: DNS_RECORD_DATA_GROUP,
  });

  it('should pass for correct data for type', async () => {
    let result = await schema.isValid({ type: 'A', data: '10.10.10.10' });
    expect(result).toEqual(true);
    result = await schema.isValid({
      type: 'AAAA',
      data: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    });
    expect(result).toEqual(true);
    result = await schema.isValid({ type: 'CNAME', data: 'my.domain.com' });
    expect(result).toEqual(true);
    result = await schema.isValid({ type: 'MX', data: '@' });
    expect(result).toEqual(true);
    result = await schema.isValid({ type: 'NS', data: '@' });
    expect(result).toEqual(true);
  });
  it('should fail for incorrect data for type', async () => {
    let result = await schema.isValid({ type: 'A', data: 'not-ipv4' });
    expect(result).toEqual(false);
    result = await schema.isValid({ type: 'AAAA', data: 'not-ipv6' });
    expect(result).toEqual(false);
    // domain name can't start with -
    result = await schema.isValid({ type: 'CNAME', data: '-my.domain.com' });
    expect(result).toEqual(false);
    // domain name must end with at least 2 char
    result = await schema.isValid({ type: 'CNAME', data: 'domain.c' });
    expect(result).toEqual(false);
    // domain name can't "end" with a -
    result = await schema.isValid({ type: 'CNAME', data: 'my.domain-.com' });
    expect(result).toEqual(false);
    // other types are currently not editable so always return true
  });
});

describe('ENUM_GROUP validates', () => {
  const enumList = ['apple', 'banana', 'mango', 'orange'];
  const schemaRequired = yup.object().shape({
    data: ENUM_GROUP(enumList),
  });
  const schemaOptional = yup.object().shape({
    data: ENUM_GROUP(enumList, false),
  });

  it('should pass for value in enum list', async () => {
    let result = await schemaRequired.isValid({ data: 'mango' });
    expect(result).toEqual(true);
    result = await schemaOptional.isValid({ data: 'mango' });
    expect(result).toEqual(true);
  });

  it('should pass for no value for optional field', async () => {
    let result = await schemaOptional.isValid({ data: '' });
    expect(result).toEqual(true);
    result = await schemaOptional.isValid({ data: undefined });
    expect(result).toEqual(true);
    result = await schemaOptional.isValid({});
    expect(result).toEqual(true);
  });

  it('should fail for no value for required field', async () => {
    let result = await schemaRequired.isValid({ data: '' });
    expect(result).toEqual(false);
    result = await schemaRequired.isValid({ data: undefined });
    expect(result).toEqual(false);
    result = await schemaRequired.isValid({});
    expect(result).toEqual(false);

    // expect to get field to receive error
    try {
      await schemaRequired.validate({ data: '' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual(
        'Please select a valid value from dropdown',
      );
    }
    try {
      await schemaRequired.validate({ data: undefined });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Field is required');
    }
  });

  it('should fail for value NOT in enum list', async () => {
    let result = await schemaRequired.isValid({ data: 'plum' });
    expect(result).toEqual(false);
    result = await schemaOptional.isValid({ data: 'plum' });
    expect(result).toEqual(false);

    // expect to get field to receive error
    try {
      await schemaRequired.validate({ data: 'plum' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual(
        'Please select a valid value from dropdown',
      );
    }
    try {
      await schemaOptional.validate({ data: 'plum' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual(
        'Please select a valid value from dropdown',
      );
    }
  });
});

describe('getIntegerWithUnitsValidation validates', () => {
  const schema = yup.object().shape({
    data: getIntegerWithUnitsValidation('h', 5, 10),
  });
  const schema2 = yup.object().shape({
    data: getIntegerWithUnitsValidation('km', 5, 10),
  });

  it('should pass for number in range with correct units', async () => {
    let result = await schema.isValid({ data: '7h' });
    expect(result).toEqual(true);
    result = await schema2.isValid({ data: '8km' });
    expect(result).toEqual(true);
  });
  it('should fail for empty value since field is required', async () => {
    const result = await schema.isValid({ data: '' });
    expect(result).toEqual(false);
    // expect to get Field is required error
    try {
      await schema.validate({ data: '' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Field is required');
    }
  });
  it('should fail for number out of range', async () => {
    const result = await schema.isValid({ data: '17h' });
    expect(result).toEqual(false);
    // expect to get Must be integer between... error
    try {
      await schema.validate({ data: '17h' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Must be integer between 5 and 10');
    }
  });
  it('should fail for number with no units', async () => {
    const result = await schema.isValid({ data: '17' });
    expect(result).toEqual(false);
  });
  it('should fail for value with units NOT at end', async () => {
    const result = await schema.isValid({ data: '1h7' });
    expect(result).toEqual(false);
  });

  it('should fail for number in range with incorrect units', async () => {
    const result = await schema.isValid({ data: '7m' });
    expect(result).toEqual(false);
  });

  it('should fail for non number', async () => {
    const result = await schema.isValid({ data: 'abc' });
    expect(result).toEqual(false);
  });
});

describe('getOptIntegerWithUnitsValidation validates', () => {
  const schema = yup.object().shape({
    data: getOptIntegerWithUnitsValidation('h', 5, 10),
  });

  it('should pass for number in range with correct units', async () => {
    const result = await schema.isValid({ data: '7h' });
    expect(result).toEqual(true);
  });
  it('should pass for empty value since field is optional', async () => {
    const result = await schema.isValid({ data: '' });
    expect(result).toEqual(true);
  });
  it('should fail for number out of range', async () => {
    const result = await schema.isValid({ data: '17h' });
    expect(result).toEqual(false);
    // expect to get Must be integer between... error
    try {
      await schema.validate({ data: '17h' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Must be integer between 5 and 10');
    }
  });
});

describe('UUID_GROUP_OPTIONS validates', () => {
  const schemaRequired = yup.object().shape({
    data: UUID_GROUP_OPTIONS(),
  });
  const schemaOptional = yup.object().shape({
    data: UUID_GROUP_OPTIONS(false),
  });

  const validUuid = '5af22713-6fb7-4997-8f3c-70f0a335d5a3';
  const invalidUuid = 'abc';

  it('should fail for empty required field', async () => {
    const result = await schemaRequired.isValid({ data: '' });
    expect(result).toEqual(false);
  });
  it('should pass for empty optional field', async () => {
    const result = await schemaOptional.isValid({ data: '' });
    expect(result).toEqual(true);
  });

  it('should pass for valid uuid', async () => {
    let result = await schemaRequired.isValid({ data: validUuid });
    expect(result).toEqual(true);
    result = await schemaOptional.isValid({ data: validUuid });
    expect(result).toEqual(true);
  });

  it('should fail for invalid uuid', async () => {
    let result = await schemaRequired.isValid({ data: invalidUuid });
    expect(result).toEqual(false);
    result = await schemaOptional.isValid({ data: invalidUuid });
    expect(result).toEqual(false);
  });
});

describe('UUID_ONLY_ONE_FROM_GROUP validates', () => {
  const schema = yup.object().shape({
    uuid1: UUID_ONLY_ONE_FROM_GROUP('uuid1', ['uuid2', 'uuid3']),
    uuid2: UUID_ONLY_ONE_FROM_GROUP('uuid2', ['uuid1', 'uuid3']),
    uuid3: UUID_ONLY_ONE_FROM_GROUP('uuid3', ['uuid1', 'uuid2']),
  });
  const optionalSchema = yup.object().shape({
    uuid1: UUID_ONLY_ONE_FROM_GROUP('uuid1', ['uuid2', 'uuid3'], true),
    uuid2: UUID_ONLY_ONE_FROM_GROUP('uuid2', ['uuid1', 'uuid3'], true),
    uuid3: UUID_ONLY_ONE_FROM_GROUP('uuid3', ['uuid1', 'uuid2'], true),
  });
  const validUuid = '5af22713-6fb7-4997-8f3c-70f0a335d5a3';
  const invalidUuid = 'abc';

  it('should pass when ONE uuid is filled in', async () => {
    let result = await schema.isValid({
      uuid1: validUuid,
      uuid2: null,
      uuid3: '',
    });
    expect(result).toEqual(true);
    result = await schema.isValid({ uuid1: null, uuid2: validUuid, uuid3: '' });
    expect(result).toEqual(true);

    result = await optionalSchema.isValid({
      uuid1: validUuid,
      uuid2: null,
      uuid3: '',
    });
    expect(result).toEqual(true);
    result = await optionalSchema.isValid({
      uuid1: null,
      uuid2: validUuid,
      uuid3: '',
    });
    expect(result).toEqual(true);
  });

  it('should pass when no uuid is filled in and fields are "optional"', async () => {
    const result = await optionalSchema.isValid({
      uuid1: null,
      uuid2: null,
      uuid3: '',
    });
    expect(result).toEqual(true);
  });

  it('should fail when MULTIPLE uuids are filled in', async () => {
    let result = await schema.isValid({
      uuid1: validUuid,
      uuid2: '',
      uuid3: validUuid,
    });
    expect(result).toEqual(false);

    result = await optionalSchema.isValid({
      uuid1: validUuid,
      uuid2: null,
      uuid3: validUuid,
    });
    expect(result).toEqual(false);

    // expect to get field to receive error
    try {
      await schema.validate({ uuid1: validUuid, uuid2: '', uuid3: validUuid });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual(
        'Only one of these fields may be filled in',
      );
    }
    try {
      await optionalSchema.validate({
        uuid1: validUuid,
        uuid2: null,
        uuid3: validUuid,
      });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual(
        'Only one of these fields may be filled in',
      );
    }
  });

  it('should fail when no uuid is filled in and not "optional"', async () => {
    let result = await schema.isValid({
      uuid1: null,
      uuid2: null,
      uuid3: null,
    });
    expect(result).toEqual(false);
    result = await schema.isValid({ uuid1: '', uuid2: '', uuid3: '' });
    expect(result).toEqual(false);

    // expect to get field to receive error
    try {
      await schema.validate({ uuid1: null, uuid2: null, uuid3: null });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('One of these fields must be filled in');
    }
  });

  it('should fail when invalid uuid is filled in', async () => {
    let result = await schema.isValid({
      uuid1: invalidUuid,
      uuid2: null,
      uuid3: null,
    });
    expect(result).toEqual(false);
    result = await optionalSchema.isValid({
      uuid1: invalidUuid,
      uuid2: null,
      uuid3: null,
    });
    expect(result).toEqual(false);

    // expect to get field to receive error
    try {
      await schema.validate({ uuid1: invalidUuid, uuid2: null, uuid3: null });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual(UUID_BASE.regexError);
    }
    try {
      await optionalSchema.validate({
        uuid1: invalidUuid,
        uuid2: null,
        uuid3: null,
      });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual(UUID_BASE.regexError);
    }
  });
});

describe('RESOURCE_QUANTITY_WITH_MINIMUM_GROUP validates', () => {
  const schemaRequired = yup.object().shape({
    data: RESOURCE_QUANTITY_WITH_MINIMUM_GROUP(1e8, 'Minimum 100M', true),
  });
  const schemaOptional = yup.object().shape({
    data: RESOURCE_QUANTITY_WITH_MINIMUM_GROUP(1e11, 'Minimum 100G', false),
  });

  it('should pass for exponential value greater than minimum', async () => {
    let result = await schemaRequired.isValid({ data: '2e8' });
    expect(result).toEqual(true);
    result = await schemaOptional.isValid({ data: '3e12' });
    expect(result).toEqual(true);
  });

  it('should pass for integer value greater than minimum', async () => {
    let result = await schemaRequired.isValid({ data: '2G' });
    expect(result).toEqual(true);
    result = await schemaOptional.isValid({ data: '10T' });
    expect(result).toEqual(true);
  });

  it('should pass for no value for optional field', async () => {
    let result = await schemaOptional.isValid({ data: '' });
    expect(result).toEqual(true);
    result = await schemaOptional.isValid({ data: undefined });
    expect(result).toEqual(true);
    result = await schemaOptional.isValid({});
    expect(result).toEqual(true);
  });

  it('should fail for no value for required field', async () => {
    let result = await schemaRequired.isValid({ data: '' });
    expect(result).toEqual(false);
    result = await schemaRequired.isValid({ data: undefined });
    expect(result).toEqual(false);
    result = await schemaRequired.isValid({});
    expect(result).toEqual(false);

    // expect to get field to receive error
    try {
      await schemaRequired.validate({ data: '' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Field is required');
    }
    try {
      await schemaRequired.validate({ data: undefined });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Field is required');
    }
  });

  it('should fail for exponential value less than minimum', async () => {
    let result = await schemaRequired.isValid({ data: '4e6' });
    expect(result).toEqual(false);
    result = await schemaOptional.isValid({ data: '6e9' });
    expect(result).toEqual(false);

    // expect to get field to receive error
    try {
      await schemaRequired.validate({ data: '4e6' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Minimum 100M');
    }
    try {
      await schemaOptional.validate({ data: '6e9' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Minimum 100G');
    }
  });

  it('should fail for integer value less than minimum', async () => {
    let result = await schemaRequired.isValid({ data: '10k' });
    expect(result).toEqual(false);
    result = await schemaRequired.isValid({ data: '99M' });
    expect(result).toEqual(false);
    result = await schemaOptional.isValid({ data: '20Mi' });
    expect(result).toEqual(false);
    result = await schemaOptional.isValid({ data: '99G' });
    expect(result).toEqual(false);

    // expect to get field to receive error
    try {
      await schemaRequired.validate({ data: '10k' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Minimum 100M');
    }
    try {
      await schemaOptional.validate({ data: '20Mi' });
      fail('should have received exception on validate');
    } catch (error: any) {
      expect(error?.errors[0]).toEqual('Minimum 100G');
    }
  });
});
