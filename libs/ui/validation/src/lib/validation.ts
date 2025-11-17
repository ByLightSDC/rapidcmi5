/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 Validation definitions
 https://www.npmjs.com/package/yup#api
 */

import yaml from 'js-yaml';
import * as yup from 'yup';
import {
  accessKeyRegex,
  accessKeySecretRegex,
  amazonMachineIdRegex,
  cpeFieldRegex,
  cpeLanguageRegex,
  descriptionRegex,
  domainNameRegex,
  hostNameRegex,
  httpsUriRegex,
  ipv4Regex,
  ipv6Regex,
  latitudeRegex,
  longitudeRegex,
  macAddressErrorMessage,
  macAddressRegex,
  nameRegex,
  preferencedDomainNameRegex,
  resourceQuantityErrorMessage,
  resourceQuantityRegex,
  timeHHMMSSRegex,
  uuidRegex,
} from './validationRegex';

import {
  DESCRIPTION_BASE,
  EMAIL_BASE,
  INTEGER_BASE,
  LATITUDE_BASE,
  LONGITUDE_BASE,
  LONG_NAME_BASE,
  NAME_BASE,
  NO_SPECIAL_CHARACTERS_ERROR,
  NUMBER_ERROR,
  REQUIRED_ERROR,
  SPACES_ERROR,
  SPECIFY_AT_LEAST_ONE_ERROR,
  URL_BASE,
  UUID_BASE,
  maxPort,
  minPort,
} from './validationTypes';

export const REQUIRED_ENTRY = yup.string().required(REQUIRED_ERROR);

/** @constant
 * Required field of specified type
 */
export const REQUIRED_ENTRY_OF = <T>(defaultVal: T, error = REQUIRED_ERROR) => {
  const requiredType = typeof defaultVal;
  switch (requiredType) {
    case 'string':
      return yup.string().required(error);
    case 'boolean':
      return yup.boolean().required(error);
    case 'number':
      return yup.number().required(error);
    default:
      return yup.string().required(error);
  }
};

/** @constant
 * Verify entry is in the specified enum
 */
export const ENUM_GROUP = <T extends object>(
  enumObject: T,
  isRequired = true,
) => {
  if (isRequired) {
    return yup
      .mixed<T>()
      .required(REQUIRED_ERROR)
      .oneOf(
        Object.values(enumObject),
        'Please select a valid value from dropdown',
      );
  }
  return yup
    .mixed<T>()
    .oneOf(
      [null, '', ...Object.values(enumObject)],
      'Please select a valid value from dropdown',
    );
};

/** @constant
 * Verify neither or BOTH fields filled in
 */
export function NEITHER_OR_BOTH_GROUP(
  firstField: string,
  secondField: string,
  errorMessage: string,
) {
  return yup
    .string()
    .nullable()
    .test('neither-or-both', errorMessage, function (code) {
      const first = this.parent[firstField];
      const second = this.parent[secondField];
      // either second is empty OR both need values
      return (
        !second ||
        second?.length === 0 ||
        (first?.length > 0 && second?.length > 0)
      );
    });
}

/** @constant
 * Optional Name Field
 */
export const NAME_GROUP_OPT = yup
  .string()
  .nullable()
  .max(NAME_BASE.maxCount, NAME_BASE.maxCountError)
  .matches(NAME_BASE.regex, {
    message: NAME_BASE.regexError,
    excludeEmptyString: true,
  })
  .trim(NAME_BASE.spacesError)
  .strict(true);

/** @constant
 * Required Name Field
 */
export const NAME_GROUP = yup
  .string()
  .required(NAME_BASE.requiredError)
  .min(NAME_BASE.minCount, NAME_BASE.minCountError)
  .max(NAME_BASE.maxCount, NAME_BASE.maxCountError)
  .matches(NAME_BASE.regex, NAME_BASE.regexError)
  .trim(NAME_BASE.spacesError)
  .strict(true);

export const LONG_NAME_GROUP_OPT = yup
  .string()
  .nullable()
  .max(LONG_NAME_BASE.maxCount, LONG_NAME_BASE.maxCountError)
  .matches(LONG_NAME_BASE.regex, {
    message: LONG_NAME_BASE.regexError,
    excludeEmptyString: true,
  })
  .trim(LONG_NAME_BASE.spacesError)
  .strict(true);

export const LONG_NAME_GROUP = yup
  .string()
  .required(LONG_NAME_BASE.requiredError)
  .min(LONG_NAME_BASE.minCount, LONG_NAME_BASE.minCountError)
  .max(LONG_NAME_BASE.maxCount, LONG_NAME_BASE.maxCountError)
  .matches(LONG_NAME_BASE.regex, LONG_NAME_BASE.regexError)
  .trim(LONG_NAME_BASE.spacesError)
  .strict(true);

/* Description Fields */
export const DESCRIPTION_GROUP_OPT = yup
  .string()
  .nullable()
  .max(DESCRIPTION_BASE.maxCount, DESCRIPTION_BASE.maxCountError)
  .matches(DESCRIPTION_BASE.regex, {
    message: DESCRIPTION_BASE.regexError,
    excludeEmptyString: true,
  })
  .trim(DESCRIPTION_BASE.spacesError)
  .strict(true);

export const DESCRIPTION_GROUP = yup
  .string()
  .required(DESCRIPTION_BASE.requiredError)
  .min(DESCRIPTION_BASE.minCount, DESCRIPTION_BASE.minCountError)
  .max(DESCRIPTION_BASE.maxCount, DESCRIPTION_BASE.maxCountError)
  .matches(DESCRIPTION_BASE.regex, DESCRIPTION_BASE.regexError)
  .trim(DESCRIPTION_BASE.spacesError)
  .strict(true);

/* Domain */
export const DOMAIN_NAME_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .test(
    'is-valid-domain-name',
    'Name must be a valid domain name',
    function (value) {
      return domainNameRegex.test(value as string);
    },
  );

/* Email Fields */
export const EMAIL_GROUP = yup
  .string()
  .required(EMAIL_BASE.requiredError)
  .matches(EMAIL_BASE.regex, EMAIL_BASE.regexError);

/* Hostname */
export const HOST_NAME_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .test(
    'is-valid-host-name',
    'Name must be a valid host name',
    function (value) {
      return hostNameRegex.test(value as string);
    },
  );

/* Integer Fields */
export const INTEGER_GROUP = (isRequired = true) => {
  return isRequired
    ? yup
        .number()
        .typeError(INTEGER_BASE.integerError)
        .required(INTEGER_BASE.requiredError)
        .integer(INTEGER_BASE.integerError)
    : yup
        .number()
        .nullable()
        // transform to convert empty string to a null so won't get NaN
        .transform((_, val) => (val !== '' ? Number(val) : null))
        .integer(INTEGER_BASE.integerError);
};

export const POS_INTEGER_GROUP = yup
  .number()
  .typeError(INTEGER_BASE.posIntegerError)
  .required(INTEGER_BASE.requiredError)
  .integer(INTEGER_BASE.posIntegerError)
  .min(INTEGER_BASE.minPosInteger, INTEGER_BASE.minPosIntegerError)
  .max(INTEGER_BASE.maxPosInteger, INTEGER_BASE.maxPosIntegerError);

export const POS_INTEGER_GROUP_OPT = yup
  .number()
  .nullable()
  // transform to convert empty string to a null so won't get NaN
  .transform((_, val) => (val !== '' ? Number(val) : null))
  .integer(INTEGER_BASE.posIntegerError)
  .min(INTEGER_BASE.minPosInteger, INTEGER_BASE.minPosIntegerError)
  .max(INTEGER_BASE.maxPosInteger, INTEGER_BASE.maxPosIntegerError);

/* Integer with Units Fields (e.g. 720h)*/
export function getIntegerWithUnitsValidation(
  units: string,
  min: number,
  max: number,
  rangeError?: string,
) {
  return yup
    .string()
    .required(REQUIRED_ERROR)
    .test(
      'is-integer',
      rangeError
        ? rangeError
        : 'Must be integer between ' + min + ' and ' + max,
      function (fieldValue) {
        if (fieldValue) {
          const fieldLength = fieldValue.length;
          if (fieldValue.indexOf(units) !== fieldLength - units.length) {
            return false; // must have correct units at end
          }
          const noUnitsValue = fieldValue.replace(units, '') || '';
          const noUnitsAsNumber = +noUnitsValue;
          return (
            !noUnitsValue ||
            (!isNaN(noUnitsAsNumber) &&
              noUnitsAsNumber >= min &&
              noUnitsAsNumber <= max)
          );
        }
        return false; // it is required
      },
    );
}

export function getOptIntegerWithUnitsValidation(
  units: string,
  min: number,
  max: number,
) {
  return yup
    .string()
    .nullable()
    .test(
      'is-integer',
      'Must be integer between ' + min + ' and ' + max,
      function (fieldValue) {
        if (fieldValue) {
          const fieldLength = fieldValue.length;
          if (fieldValue.indexOf(units) !== fieldLength - 1) {
            return false; // must have correct units at end
          }
          const noUnitsValue = fieldValue.replace(units, '') || '';
          const noUnitsAsNumber = +noUnitsValue;
          return (
            !noUnitsValue ||
            (!isNaN(noUnitsAsNumber) &&
              noUnitsAsNumber >= min &&
              noUnitsAsNumber <= max)
          );
        }
        return true; // it is optional
      },
    );
}

/* Decimal Number fields */
export const NUMBER_GROUP = (isRequired = true) => {
  return isRequired
    ? yup.number().typeError(NUMBER_ERROR).required(REQUIRED_ERROR)
    : yup
        .number()
        .nullable()
        // transform to convert empty string to a null so won't get NaN
        .transform((_, val) => (val !== '' ? Number(val) : null))
        .typeError(NUMBER_ERROR);
};

/* Min / Max field comparison tests */
/**
 * Determines whether value of min field is <= value of max field (when both are filled in)
 * @param {any} parent parent field for min/max fields within yup scope
 * @param {string} minField Name of database Min Field
 * @param {string} maxField Name of database Max Field
 * @returns boolean
 */
export const testMinMaxFields = (
  parent: any,
  minField: string,
  maxField: string,
) => {
  const min = parent[minField];
  const max = parent[maxField];
  // only check if both are filled in
  if (min && max) {
    return (min as number) <= (max as number);
  }
  return true;
};

/* JSON Field */
export const JSON_GROUP = (isRequired = true) => {
  const testJsonFormat = (fieldValue: string | undefined | null) => {
    if (!fieldValue) {
      return true;
    }
    try {
      JSON.parse(fieldValue);
      return true;
    } catch (error) {
      return false;
    }
  };
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .test('json', 'Invalid JSON', function (fieldValue) {
          return testJsonFormat(fieldValue);
        })
    : yup
        .string()
        .nullable()
        .test('json', 'Invalid JSON', function (fieldValue) {
          return testJsonFormat(fieldValue);
        });
};

/* YAML Field */
export const YAML_GROUP = (isRequired = true) => {
  const testYamlFormat = (fieldValue: string | undefined | null) => {
    if (!fieldValue) {
      return true;
    }
    try {
      yaml.load(fieldValue);
      return true;
    } catch (error) {
      return false;
    }
  };
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .test('json', 'Invalid YAML', function (fieldValue) {
          return testYamlFormat(fieldValue);
        })
    : yup
        .string()
        .nullable()
        .test('json', 'Invalid YAML', function (fieldValue) {
          return testYamlFormat(fieldValue);
        });
};
/* Location Fields */
/**
 * Determines whether the given latitude (or longitude) is a valid value
 * @param {any} parent parent field for lat/lon within yup scope
 * @param {string} latitudeField Name of database Latitude field
 * @param {string} longitudeField Name of database Longitude field
 * @param {boolean} isLatitude Whether testing the latitude field (or longitude)
 * @returns boolean
 */
const testLatitudeLongitudeRegex = (
  parent: any,
  latitudeField: string,
  longitudeField: string,
  isLatitude: boolean,
) => {
  const latitude = parent[latitudeField];
  const longitude = parent[longitudeField];

  if (isLatitude) {
    if (latitude && !latitudeRegex.test(latitude)) {
      return false;
    }
  } else {
    if (longitude && !longitudeRegex.test(longitude)) {
      return false;
    }
  }
  // no error
  return true;
};

/**
 * Determines whether the latitude/longitude are both empty or both filled in since they are dependent on each other
 * @param {any} parent parent field for lat/lon within yup scope
 * @param {string} latitudeField Name of database Latitude field
 * @param {string} longitudeField Name of database Longitude field
 * @param {boolean} isLatitude Whether testing the latitude field (or longitude)
 * @returns boolean
 */
const testLatitudeLongitudeDependency = (
  parent: any,
  latitudeField: string,
  longitudeField: string,
  isLatitude: boolean,
) => {
  const latitude = parent[latitudeField];
  const longitude = parent[longitudeField];

  if (isLatitude) {
    // check dependency on longitude
    if ((!latitude || latitude?.length === 0) && longitude?.length > 0) {
      return false;
    }
  } else {
    // check dependency on latitude
    if ((!longitude || longitude?.length === 0) && latitude?.length > 0) {
      return false;
    }
  }
  // no error
  return true;
};

/**
 * Returns yup validator for latitude OR longitude field within a pair
 * latitude/longitude must BOTH be filled in if one is or must both be empty (if not required)
 * @param {string} latitudeField Name of database Latitude field
 * @param {string} longitudeField Name of database Longitude field
 * @param {boolean} isLatitude Whether testing the latitude field (or longitude)
 * @param {boolean} isRequired Whether the latitude/longitude pair is required
 * @returns yup validation
 */
export function LATITUDE_LONGITUDE_GROUP(
  latitudeField = 'latitude',
  longitudeField = 'longitude',
  isLatitude = true,
  isRequired = false,
) {
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .test(
          'latitude-longitude-regex',
          isLatitude ? LATITUDE_BASE.regexError : LONGITUDE_BASE.regexError,
          function (code) {
            return testLatitudeLongitudeRegex(
              this.parent,
              latitudeField,
              longitudeField,
              isLatitude,
            );
          },
        ) // since required - don't need to test "dependency"
    : yup
        .string()
        .nullable()
        .test(
          'latitude-longitude-regex',
          isLatitude ? LATITUDE_BASE.regexError : LONGITUDE_BASE.regexError,
          function (code) {
            return testLatitudeLongitudeRegex(
              this.parent,
              latitudeField,
              longitudeField,
              isLatitude,
            );
          },
        )
        .test(
          'latitude-longitude-dependency',
          isLatitude
            ? LATITUDE_BASE.dependentError
            : LONGITUDE_BASE.dependentError,
          function (code) {
            return testLatitudeLongitudeDependency(
              this.parent,
              latitudeField,
              longitudeField,
              isLatitude,
            );
          },
        );
}

/* IP Address Fields */
/**
 * Returns whether one of the IP Address fields is filled in
 * @param {string} addressField Name of database IP Address field
 * @param {string} latitudeField Name of database Latitude field
 * @param {string} longitudeField Name of database Longitude field
 * @param {string} countryField Name of database Country field
 * @returns boolean
 */
const testOneOfAddressFields = (
  parent: any,
  addressField: string,
  latitudeField: string,
  longitudeField: string,
  countryField: string,
) => {
  const address = parent[addressField];
  const latitude = parent[latitudeField];
  const longitude = parent[longitudeField];
  const country = parent[countryField];

  // One of these needs to be filled in
  if (
    (address && address.length > 0) ||
    (latitude && latitude.length > 0) ||
    (longitude && longitude.length > 0) ||
    (country && country.length > 0)
  ) {
    return true;
  }
  return false;
};

export const oneOfAddressFieldsErrorMessage =
  'One of IP Address, Coordinates, or Country must be filled in';

/**
 * Returns yup validator for requiring one of three types of IP Address to be filled in
 * @param addressField
 * @param latitudeField
 * @param longitudeField
 * @param countryField
 * @returns yup validation
 */
export const OneOfAddressFields = (
  addressField: string,
  latitudeField: string,
  longitudeField: string,
  countryField: string,
) => {
  return yup
    .string()
    .nullable()
    .test('one_of_addresses', oneOfAddressFieldsErrorMessage, function (code) {
      return testOneOfAddressFields(
        this.parent,
        addressField,
        latitudeField,
        longitudeField,
        countryField,
      );
    });
};

/**
 * Returns yup validator for optional Latitude WITH Longitude OR
 * requiring one of three types of IP Address to be filled in
 * @param addressField
 * @param latitudeField
 * @param longitudeField
 * @param countryField
 * @returns yup validation
 */
export const LatitudeOneOfAddressFields = (
  addressField: string,
  latitudeField: string,
  longitudeField: string,
  countryField: string,
) => {
  return yup
    .string()
    .nullable()
    .matches(LATITUDE_BASE.regex, LATITUDE_BASE.regexError)
    .test('is-longitude-exists', LATITUDE_BASE.dependentError, function (code) {
      const latitude = this.parent[latitudeField];
      const longitude = this.parent[longitudeField];
      // either longitude is empty OR both need values
      return (
        !longitude ||
        longitude.length === 0 ||
        (latitude?.length > 0 && longitude?.length > 0)
      );
    })
    .test('one_of_addresses', oneOfAddressFieldsErrorMessage, function (code) {
      return testOneOfAddressFields(
        this.parent,
        addressField,
        latitudeField,
        longitudeField,
        countryField,
      );
    });
};

/**
 * Returns yup validator for optional Longitude WITH Latitude OR
 * requiring one of three types of IP Address to be filled in
 * @param addressField
 * @param latitudeField
 * @param longitudeField
 * @param countryField
 * @returns yup validation
 */
export const LongitudeOneOfAddressFields = (
  addressField: string,
  latitudeField: string,
  longitudeField: string,
  countryField: string,
) => {
  return yup
    .string()
    .nullable()
    .matches(LONGITUDE_BASE.regex, LONGITUDE_BASE.regexError)
    .test('is-latitude-exists', LONGITUDE_BASE.dependentError, function (code) {
      const latitude = this.parent[latitudeField];
      const longitude = this.parent[longitudeField];
      // either latitude is empty OR both need values
      return (
        !latitude ||
        latitude?.length === 0 ||
        (latitude?.length > 0 && longitude?.length > 0)
      );
    })
    .test('one_of_addresses', oneOfAddressFieldsErrorMessage, function (code) {
      return testOneOfAddressFields(
        this.parent,
        addressField,
        latitudeField,
        longitudeField,
        countryField,
      );
    });
};

/**
 * Returns yup validator for a topic metadata field
 * use this for validation schema on form
 *   metadata: METADATA_GROUP()
 */
export const METADATA_GROUP = () => {
  return yup.object().shape({
    rangeOsUI: yup.object().shape({
      tags: yup
        .array()
        .of(NAME_GROUP)
        .test('unique', 'Tags must be unique', (values) => {
          return new Set(values).size === (values ? values.length : 0);
        }),
    }),
  });
};

/* PORT with Min Max Range */
export const PORT_GROUP = (isRequired = true) => {
  return isRequired
    ? yup
        .number()
        .typeError('Must be a positive integer')
        .required('Field is required')
        .integer('Must be a positive integer')
        .min(
          minPort,
          'Must be a number in the range of ' + minPort + '-' + maxPort,
        )
        .max(
          maxPort,
          'Must be a number in the range of ' + minPort + '-' + maxPort,
        )
    : yup
        .number()
        .nullable()
        // transform to convert empty string to a null so won't get NaN
        .transform((_, val) => (val !== '' ? Number(val) : null))
        .integer('Must be a positive integer')
        .min(
          minPort,
          'Must be a number in the range of ' + minPort + '-' + maxPort,
        )
        .max(
          maxPort,
          'Must be a number in the range of ' + minPort + '-' + maxPort,
        );
};

/* REGEX Fields */
export const REGEX_GROUP = (
  expression: RegExp,
  isRequired: boolean,
  regexError: string,
) => {
  return isRequired
    ? yup.string().required(REQUIRED_ERROR).matches(expression, regexError)
    : // lazy allows us to check for empty string or nullable or matches expression
      (yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup.string().matches(expression, regexError),
      ) as any);
};

/* Time Fields */
/**
 * Determines whether the given start <= end
 * @param {any} parent parent field for start/end fields within yup scope
 * @param {string} [startField] Name of database Start Time field
 * @param {string} [endField] Name of database End Time field
 * @returns boolean
 */
const testHHMMSSTimes = (
  parent: any,
  startField?: string,
  endField?: string,
) => {
  // nothing to check if both fields aren't given
  if (!startField || !endField) {
    return true;
  }
  const startTime = parent[startField];
  const endTime = parent[endField];
  // only check if both are filled in
  if (startTime && endTime) {
    return startTime <= endTime;
  }
  return true;
};

/**
 * Returns yup validator for time field of format HH:MM:SS
 * start time must be <= end time if those fields are passed in
 * @param {boolean} isRequired Whether field is required or not
 * @param {boolean} isStartField Whether testing the start or end
 * @param {string} [startField] Name of database Start Time field
 * @param {string} [endField] Name of database End Time field
 * @returns boolean
 */
export const HHMMSS_TIME_GROUP = (
  isRequired = true,
  isStartField = true,
  startField?: string,
  endField?: string,
) => {
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .matches(timeHHMMSSRegex, 'Must match time format of HH:MM:SS')
        .test(
          'start-end-time-check',
          isStartField
            ? 'Start Time must be earlier than End Time'
            : 'End Time must be later than Start Time',
          function (code) {
            return testHHMMSSTimes(this.parent, startField, endField);
          },
        )
    : // lazy allows us to check for empty string or nullable or matches expression
      yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup
              .string()
              .matches(timeHHMMSSRegex, 'Must match time format of HH:MM:SS')
              .test(
                'start-end-time-check',
                isStartField
                  ? 'Start Time must be earlier than End Time'
                  : 'End Time must be later than Start Time',
                function (code) {
                  return testHHMMSSTimes(this.parent, startField, endField);
                },
              ),
      );
};

/* Unique Array Text Fields */
export const UNIQUE_ARRAY_STRING_GROUP = (
  fieldYupFormat: any,
  isRequired: boolean,
  uniquenessError: string,
) => {
  return isRequired
    ? yup
        .array()
        .min(1, SPECIFY_AT_LEAST_ONE_ERROR)
        .of(fieldYupFormat)
        .test('unique', uniquenessError, (values) => {
          return new Set(values).size === (values ? values.length : 0);
        })
    : yup
        .array()
        .of(fieldYupFormat)
        .test('unique', uniquenessError, (values) => {
          return new Set(values).size === (values ? values.length : 0);
        });
};

/* URI Fields */
export const URL_GROUP = yup
  .string()
  .required(URL_BASE.requiredError)
  .url(URL_BASE.urLError)
  .strict(true);

export const URL_GROUP_OPT = yup
  .string()
  .nullable()
  .url(URL_BASE.urLError)
  .strict(true);

/**
 * Validates url AND that it starts with https://
 * @param {boolean} [isRequired = true] Whether field is required
 * @returns
 */
const startsWithHttps = (value: any) => {
  if (value && (value as string).startsWith('https://')) {
    return true;
  }
  return false;
};
export const STARTS_WITH_HTTPS_GROUP = (isRequired = true) => {
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .matches(httpsUriRegex, 'Must start with https://')
        .strict(true)
    : // lazy allows us to check for empty string or nullable OR uuid
      yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup
              .string()
              .matches(httpsUriRegex, 'Must start with https://')
              .strict(true),
      );
};

export const HTTPS_URL_GROUP = (isRequired = true) => {
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .url(URL_BASE.urLError)
        .test(
          'test-https-url',
          'Must be Valid URL starting with https://',
          (value) => {
            return startsWithHttps(value);
          },
        )
        .strict(true)
    : // lazy allows us to check for empty string or nullable OR uuid
      yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup
              .string()
              .url(URL_BASE.urLError)
              .test(
                'test-https-url',
                'Must be Valid URL starting with https://',
                (value) => {
                  return startsWithHttps(value);
                },
              )
              .strict(true),
      );
};
/**
 * Validates url AND that it starts with https:// AND ends with .git
 * @param {boolean} [isRequired = true] Whether field is required
 * @returns
 */
const endsWithGit = (value: any) => {
  if (value && (value as string).endsWith('.git')) {
    return true;
  }
  return false;
};
export const GIT_URL_GROUP = (isRequired = true) => {
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .url(URL_BASE.urLError)
        .test(
          'test-git-url',
          'Must be Valid URL starting with https:// and ending with .git',
          (value) => {
            return startsWithHttps(value) && endsWithGit(value);
          },
        )
        .strict(true)
    : // lazy allows us to check for empty string or nullable OR uuid
      yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup
              .string()
              .url(URL_BASE.urLError)
              .test(
                'test-git-url',
                'Must be Valid URL starting with https:// and ending with .git',
                (value) => {
                  return startsWithHttps(value) && endsWithGit(value);
                },
              )
              .strict(true),
      );
};

/* UUID Fields */
export const UUID_GROUP = yup
  .string()
  .required(UUID_BASE.requiredError)
  .uuid(UUID_BASE.regexError)
  .strict(true);

/** @constant
 * Verify input is a valid uuid
 */
export const UUID_GROUP_OPTIONS = (isRequired = true) => {
  return isRequired
    ? yup
        .string()
        .required(UUID_BASE.requiredError)
        .uuid(UUID_BASE.regexError)
        .strict(true)
    : // lazy allows us to check for empty string or nullable OR uuid
      yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup.string().uuid(UUID_BASE.regexError),
      );
};

/**
 * @constant
 * Verify only one of the UUIDs in the group is filled in AND a valid UUID
 * (Optionally, they may ALL be empty)
 * @param {string} uuidField Field of interest - the field being validated
 * @param {string[]} uuidCompareFields Field(s) to compare with field of interest with
 * @param {boolean} [optional=false] Whether it is optional to have any field filled in
 * @returns yup validation
 */
export const UUID_ONLY_ONE_FROM_GROUP = (
  uuidField: string,
  uuidCompareFields: string[],
  optional = false,
) => {
  return yup
    .string()
    .nullable()
    .test('one_of_test', 'dummy message', function (value, validationContext) {
      const { createError } = validationContext;

      const fieldOfInterest = this.parent[uuidField];
      // need to incorporate this inside test because yup.uuid doesn't like '' (vs null)
      const fieldFilledIn = fieldOfInterest && fieldOfInterest.length > 0;
      if (fieldFilledIn && !uuidRegex.test(fieldOfInterest as string)) {
        return createError({
          message: UUID_BASE.regexError,
        });
      }

      let comparedFieldFilledIn = false;
      for (let i = 0; i < uuidCompareFields.length; i++) {
        const fieldCompared = this.parent[uuidCompareFields[i]];
        if (fieldCompared && fieldCompared.length > 0) {
          comparedFieldFilledIn = true;
        }
        if (fieldOfInterest?.length > 0 && fieldCompared?.length > 0) {
          return createError({
            message: 'Only one of these fields may be filled in',
          });
        }
      }

      if (!optional && !fieldFilledIn && !comparedFieldFilledIn) {
        return createError({
          message: 'One of these fields must be filled in',
        });
      }
      return true;
    });
};

/* SPECIALIZED Fields */
/* Access Key */
export const ACCESS_KEY_GROUP = (isRequired = true) => {
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .matches(
          accessKeyRegex,
          'Access Key must be 20 characters - only upper case alpha or numeric',
        )
        .strict(true)
    : // lazy allows us to check for empty string or nullable or matches expression
      (yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup
              .string()
              .matches(
                accessKeyRegex,
                'Access Key must be 20 characters - only upper case alpha or numeric',
              ),
      ) as any);
};

/* Access Key Secret */
export const ACCESS_KEY_SECRET_GROUP = (isRequired = true) => {
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .matches(
          accessKeySecretRegex,
          'Secret must be 40 characters - only alpha or numeric or + or /',
        )
        .strict(true)
    : // lazy allows us to check for empty string or nullable or matches expression
      (yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup
              .string()
              .matches(
                accessKeySecretRegex,
                'Secret must be 40 characters - only alpha or numeric or + or /',
              ),
      ) as any);
};

/* Amazon Machine ID */
export const AMAZON_MACHINE_ID_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .matches(
    amazonMachineIdRegex,
    'ID must match format "ami-" followed by 17 hex digits',
  )
  .strict(true);
export const AMAZON_MACHINE_ID_GROUP_OPT = yup
  .string()
  .nullable()
  .matches(
    amazonMachineIdRegex,
    'ID must match format "ami-" followed by 17 hex digits',
  )
  .strict(true);

/* Certificate Subject */
/* the certificate subject provides attributes to distinguish the certificate use
 * these include:
 *  c: Country
 *  sT: State or Province
 *  l: Locality
 *  o: Organization
 *  oU: Organizational Unit
 * At least one attribute must be filled in
 */
export const CERTIFICATE_SUBJECT_GROUP = yup
  .object()
  .shape({
    c: yup.string().nullable(),
    sT: yup.string().nullable(),
    l: yup.string().nullable(),
    o: yup.string().nullable(),
    oU: yup.string().nullable(),
  })
  .test(
    'subject',
    'At least one of these fields needs to be filled in',
    (value) => !!(value.c || value.sT || value.l || value.o || value.oU),
  );

/* CPE Fields */
const cpeLanguageRegexError =
  'Language must be a valid language tag as defined by [RFC5646]';
const cpeFieldRegexError =
  'Must be non-empty contiguous string of bytes encoded using (UTF-8) characters with hexadecimal values between x00 and x7F [RFC3629]';
export const CPE_LANGUAGE_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .matches(cpeLanguageRegex, cpeLanguageRegexError)
  .strict(true);

export const CPE_FIELD_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .matches(cpeFieldRegex, cpeFieldRegexError)
  .strict(true);

/* Container Tag */
/* the tag for a container cannot be the same as any existing tag for that container (name)
     Container Form has "extended" field of containerTags which is array of tags for current name
*/
export const CONTAINER_TAG_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .max(NAME_BASE.maxCount, NAME_BASE.maxCountError)
  .matches(NAME_BASE.regex, {
    message: NAME_BASE.regexError,
    excludeEmptyString: true,
  })
  .trim(NAME_BASE.spacesError)
  .test('is-unique-tag', 'Tag must be unique for Container', function (code) {
    const containerTags: string[] = this.parent['containerTags']
      ? this.parent['containerTags']
      : [];
    const tag = this.parent['tag'];
    // either tag is empty OR containerTags is empty OR tag is not in container tag list
    return !tag || containerTags.length === 0 || containerTags.indexOf(tag) < 0;
  });

/* Range DNS Zone (Domain) Name */
/* DNS Zone can be Top-Level-Domain (TLD), domain, or subdomain...
     from API discussions: "lock the Name field to lowercase, numbers, dashes so the field doesn't break 
     Bind or specify a zone with Caps in it that might be weird with something that is case sensitive"
  */
const tldDomainNameRegex =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$|^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
export const DNS_ZONE_DOMAIN_NAME_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .matches(
    tldDomainNameRegex,
    'Must be valid TLD, Domain, or Subdomain - only lowercase alpha, numbers or dashes are allowed',
  );

/* Range DNS Record Name */
/* excerpt from https://www.rfc-editor.org/rfc/rfc1035
     <character-string> is expressed in one or two ways: as a contiguous set
     of characters without interior spaces, or as a string beginning with a "
     and ending with a ".  Inside a " delimited string any character can
     occur, except for a " itself, which must be quoted using \ (back slash).
  */
const noSpaceOrQuotedRegex = /(^[\S]+$)|(^".*"$)/; // no spaces or starts/ends with quote
const escapedQuotesRegex = /^(.?$|[^"].+)|^"([^"\\]*(?:\\.[^"\\]*)*)"$/; // does not start with quote or quotes inside are escaped
export const DNS_RECORD_NAME_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .matches(
    nameRegex,
    'Only alpha-numeric characters are allowed for this field',
  )
  .matches(noSpaceOrQuotedRegex, 'No spaces allowed in unquoted string')
  .matches(
    escapedQuotesRegex,
    'Quotes within a quoted string must be escaped using \\ (backslash)',
  )
  .max(100, 'There is a 100 character limit')
  .trim(SPACES_ERROR)
  .strict();

/* Range DNS Record Data */
/* This field needs to be validated based on the current record type chosen
    A -- IPV4
    AAAA -- IPV6
    CNAME -- domain name
    MX -- @ or preference number with domain name
    NS -- @ or domain name
*/
export const DNS_RECORD_DATA_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .test(
    'is-valid-record-data',
    'Record data must be valid for record type',
    function (value) {
      const recordType = this.parent.type;
      let valid = true;
      let message = '';
      if (recordType === 'A') {
        message = 'Must be a valid IPv4 address';
        valid = ipv4Regex.test(value as string);
      } else if (recordType === 'AAAA') {
        message = 'Must be a valid IPv6 address';
        valid = ipv6Regex.test(value as string);
      } else if (recordType === 'CNAME') {
        message = 'Must be a valid domain name';
        valid = domainNameRegex.test(value as string);
      } else if (recordType === 'MX') {
        message = 'Must be @ or a valid preference number with domain name';
        valid =
          value === '@' || preferencedDomainNameRegex.test(value as string);
      } else if (recordType === 'NS') {
        message = 'Must be @ or a valid domain name';
        valid = value === '@' || domainNameRegex.test(value as string);
      }
      if (!valid) {
        return this.createError({ message: message });
      }
      return true;
    },
  );

/* Range DNS Tags */
export const DNS_TAG_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .matches(
    nameRegex,
    'Only alpha-numeric characters are allowed for this field',
  )
  .max(63, 'There is a 63 character limit')
  .strict();

/* unrestricted length data fields */
export const DATA_TEXT_GROUP_OPT = yup
  .string()
  .nullable()
  .matches(descriptionRegex, {
    message: NO_SPECIAL_CHARACTERS_ERROR,
    excludeEmptyString: true,
  })
  .trim(SPACES_ERROR)
  .strict(true);

export const IP_GROUP = yup
  .string()
  .required(REQUIRED_ERROR)
  .test('is-valid-ip', 'IP must be valid format', function (value) {
    let valid = true;
    let message = '';

    message = 'Must be a valid IPv4 or IPv6 address';
    valid = ipv4Regex.test(value as string);
    if (!valid) {
      valid = ipv6Regex.test(value as string);
    }
    // currently rest of types - field is disabled and set to @

    if (!valid) {
      return this.createError({ message: message });
    }
    return true;
  });

/* Resource Quantity with minimum value requirement */
export const RESOURCE_QUANTITY_WITH_MINIMUM_GROUP = (
  minimumByteValue: number,
  minValueErrorMsg: string,
  isRequired = true,
) => {
  const meetsMinimumRequirement = (value: string | undefined) => {
    if (value) {
      let isValid = true;

      // need to check for scientific notation (ex. 4.5e7) prior to checking for units at end of fieldValue
      const exponentIndex = value.indexOf('e');
      const checkString = value.substring(exponentIndex + 1);
      const unitsIndex = checkString.search(/[a-zA-Z]/);
      const numberValue =
        unitsIndex === -1
          ? (value as unknown as number)
          : (value.substring(
              0,
              exponentIndex + unitsIndex + 1,
            ) as unknown as number);
      const units =
        unitsIndex === -1
          ? 'b'
          : value.substring(exponentIndex + unitsIndex + 1);

      switch (units) {
        case 'b':
          isValid = numberValue >= minimumByteValue;
          break;
        case 'k':
        case 'Ki':
          isValid = numberValue * 1e3 >= minimumByteValue;
          break;
        case 'M':
        case 'Mi':
          isValid = numberValue * 1e6 >= minimumByteValue;
          break;
        case 'G':
        case 'Gi':
          isValid = numberValue * 1e9 >= minimumByteValue;
          break;
        case 'T':
        case 'Ti':
          isValid = numberValue * 1e12 >= minimumByteValue;
          break;
        case 'P':
        case 'Pi':
          isValid = numberValue * 1e15 >= minimumByteValue;
          break;
        default:
          break;
      }
      return isValid;
    }
    return true;
  };
  return isRequired
    ? yup
        .string()
        .required(REQUIRED_ERROR)
        .matches(resourceQuantityRegex, resourceQuantityErrorMessage)
        .test('meets-minimum-value', minValueErrorMsg, function (value) {
          const isValid = meetsMinimumRequirement(value);
          if (!isValid) {
            return this.createError({ message: minValueErrorMsg });
          }
          return true;
        })
        .strict(true)
    : // lazy allows us to check for empty string or nullable OR look at value
      yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup
              .string()
              .matches(resourceQuantityRegex, resourceQuantityErrorMessage)
              .test('meets-minimum-value', minValueErrorMsg, function (value) {
                const isValid = meetsMinimumRequirement(value);
                if (!isValid) {
                  return this.createError({ message: minValueErrorMsg });
                }
                return true;
              }),
      );
};

/* Range Spec Registry validations
 * assumes key value pairs set up for form for configs and mirrors
 */
export const RANGE_SPEC_REGISTRIES_GROUP = yup.object().shape({
  configKeyValuePairs: yup.array().of(
    yup.object().shape({
      name: NAME_GROUP,
    }),
  ),
  mirrorKeyValuePairs: yup.array().of(
    yup.object().shape({
      name: NAME_GROUP,
      value: yup.object().shape({
        endpoint: yup.array().of(NAME_GROUP),
        rewriteKeyValuePairs: yup.array().of(
          yup.object().shape({
            name: NAME_GROUP,
            value: NAME_GROUP,
          }),
        ),
      }),
    }),
  ),
});

/* DHCP Configuration validations
 * assumes key(name) value pairs set up for form for staticReservations
 */
export const DHCP_CONFIG_GROUP = yup
  .object()
  .nullable()
  .shape({
    // dhcpServer: handled by IP Address Component
    displayError_dhcpServer: yup.boolean().oneOf([false], 'hidden message'), // this is used inside the IP Address component fo form knows if there's an error
    dnsServers: yup.array().of(IP_GROUP),
    staticReservationsKeyValuePairs: yup.array().of(
      yup.object().shape({
        name: REGEX_GROUP(macAddressRegex, true, macAddressErrorMessage),
        // value: handled by IP Address Component
        displayError_value: yup.boolean().oneOf([false], 'hidden_message'), // this is used inside the IP Address component so form knows if there's an error
      }),
    ),
    pools: yup.array().of(
      yup.object().shape({
        // start: handled by IP Address Component
        displayError_start: yup.boolean().oneOf([false], 'hidden_message'), // this is used inside the IP Address component so form knows if there's an error
        // end: handled by IP Address Component
        displayError_end: yup.boolean().oneOf([false], 'hidden_message'), // this is used inside the IP Address component so form knows if there's an error
      }),
    ),
  });
