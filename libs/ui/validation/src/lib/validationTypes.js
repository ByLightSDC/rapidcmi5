import {
  descriptionRegex,
  emailRegex,
  latitudeRegex,
  longitudeRegex,
  labelNameRegex,
  nameRegex,
} from './validationRegex';

/*
 Validation TYPE definitions
 */
export const INTEGER_ERROR = 'Must be an integer';
export const NUMBER_ERROR = 'Must be a number';
export const LOWER_CASE_ERROR = 'Must be lowercase';
export const NO_SPECIAL_CHARACTERS_ERROR = 'No special characters allowed';
export const SPACES_ERROR = 'Leading and trailing spaces not allowed';
export const REQUIRED_ERROR = 'Field is required';
export const SPECIFY_AT_LEAST_ONE_ERROR = 'You must specify at least one';

export const minPort = 0;
export const maxPort = 65535;

// BASE VALIDATION TYPE CONFIG ______________________________________
export const NAME_BASE = new (function () {
  const minCount = 0;
  const minCountError = `There is a minimal ${minCount} character limit`;
  const maxCount = 100;
  const maxCountError = `There is a ${maxCount} character limit`;
  const requiredError = REQUIRED_ERROR;
  const spacesError = SPACES_ERROR;
  const regex = nameRegex;
  const regexError = 'Only alpha-numeric characters are allowed for this field'; // needs help
  return {
    minCount,
    minCountError,
    maxCount,
    maxCountError,
    requiredError,
    spacesError,
    regex,
    regexError,
  };
})();

// @see https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set
export const LABEL_NAME_BASE = new (function () {
  const maxCount = 63;
  const maxCountError = `There is a ${maxCount} character limit`;
  const regex = labelNameRegex;
  const regexError =
    'Label names must be 63 characters or less, beginning and ending with an alphanumeric character ([a-z0-9A-Z]) with dashes (-), underscores (_), dots (.), and alphanumerics between.';
  const spacesError = SPACES_ERROR;
  return {
    maxCount,
    maxCountError,
    regex,
    regexError,
    spacesError,
  };
})();

export const LONG_NAME_BASE = new (function () {
  const minCount = 0;
  const minCountError = `There is a minimal ${minCount} character limit`;
  const maxCount = 255;
  const maxCountError = `There is a ${maxCount} character limit`;
  const requiredError = REQUIRED_ERROR;
  const spacesError = SPACES_ERROR;
  const regex = nameRegex;
  const regexError = 'Only alpha-numeric characters are allowed for this field'; // needs help
  return {
    minCount,
    minCountError,
    maxCount,
    maxCountError,
    requiredError,
    spacesError,
    regex,
    regexError,
  };
})();

export const DESCRIPTION_BASE = new (function () {
  const minCount = 0;
  const minCountError = `There is a minimal ${minCount} character limit`;
  const maxCount = 2048;
  const maxCountError = `There is a ${maxCount} character limit`;
  const requiredError = REQUIRED_ERROR;
  const spacesError = SPACES_ERROR;
  const regex = descriptionRegex;
  const regexError = 'Only alpha-numeric characters are allowed for this field'; // needs help
  return {
    minCount,
    minCountError,
    maxCount,
    maxCountError,
    requiredError,
    spacesError,
    regex,
    regexError,
  };
})();

export const EMAIL_BASE = new (function () {
  const requiredError = REQUIRED_ERROR;
  const regex = emailRegex;
  const regexError = 'Must be a valid email address';
  return {
    requiredError,
    regex,
    regexError,
  };
})();

export const INTEGER_BASE = new (function () {
  const requiredError = REQUIRED_ERROR;
  const minPosInteger = 0;
  const maxPosInteger = 2147483647; // from BE error returned if bigger
  const integerError = INTEGER_ERROR;
  const posIntegerError = 'Must be a positive integer';
  const minPosIntegerError = 'There is a minimum value of 0';
  const maxPosIntegerError = 'There is a maximum value of 2147483647';
  return {
    minPosInteger,
    minPosIntegerError,
    maxPosInteger,
    maxPosIntegerError,
    integerError,
    posIntegerError,
    requiredError,
  };
})();

export const LATITUDE_BASE = new (function () {
  const requiredError = REQUIRED_ERROR;
  const regex = latitudeRegex;
  const regexError = 'Invalid latitude';
  const dependentError = 'Required';
  return {
    requiredError,
    regex,
    regexError,
    dependentError,
  };
})();

export const LONGITUDE_BASE = new (function () {
  const requiredError = REQUIRED_ERROR;
  const regex = longitudeRegex;
  const regexError = 'Invalid longitude';
  const dependentError = 'Required';
  return {
    requiredError,
    regex,
    regexError,
    dependentError,
  };
})();

export const UUID_BASE = new (function () {
  const requiredError = REQUIRED_ERROR;
  const regexError = 'Must be a valid UUID'; //  (5 alpha-numeric sections separated by a dash)
  return {
    requiredError,
    regexError,
  };
})();

export const URL_BASE = new (function () {
  const requiredError = REQUIRED_ERROR;
  const spacesError = SPACES_ERROR;
  const urlError = 'Must be a valid url'; // needs help
  return {
    requiredError,
    spacesError,
    urlError,
  };
})();
