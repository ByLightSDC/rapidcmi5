/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { containsCidr, parseCidr } from 'cidr-tools';
import { stringifyIp } from 'ip-bigint';

import ReadOnlyTextField from './ReadOnlyTextField';
import { ButtonIcon, ButtonInfoField } from '../inputs/buttons/buttons';
import { useDisplayFocus } from '../hooks/useDisplayFocus';

/* MUI */
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

/* Icons */
import CloseIcon from '@mui/icons-material/Close';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

import { Stack } from '@mui/system';

/* Constants */
import {
  IPv4CharsRegex,
  ipv4CidrRegex,
  ipv4OptionalCidrRegex,
  ipv4Regex,
  IPv6CharsRegex,
  ipv6CidrRegex,
  ipv6OptionalCidrRegex,
  ipv6Regex,
} from '@rangeos-nx/ui/validation';

export const ClearedIpValue = {
  Empty: '',
  Null: null,
  Undefined: undefined,
};

export enum IpAddressVersions {
  IPv4 = 4,
  IPv6 = 6,
}

export enum CidrRule {
  Required = 'required',
  Optional = 'optional',
  NotPermitted = 'not permitted',
}

const defaultAddressVersions = [IpAddressVersions.IPv4, IpAddressVersions.IPv6];
const defaultFieldRequiredMsg = 'IP address is required';
const ipV4Placeholder = 'Type IPv4 Address';
const ipv6Placeholder = 'Type IPv6 Address';

/**
 * @typedef {object} tFieldProps
 * @property {ClearedIpValue} [clearedIpValue=undefined] Set IP field to this value when cleared. should be element of ClearedIpValue const like ClearedIpValue['Null']
 * @property {any} control Form control
 * @property {any} errors Form errors
 * @property {boolean} [fullWidth=true] Whether component should stretch to fit parent width
 * @property {string | null} [infoText] Helper text for field
 * @property {string} ipFieldName IP Address field name
 * @property {number[]} [addressVersions=defaultAddressVersions] IP address versions to choose from
 * @property {number} [cidrAddressVersion] Optional Cidr Address Version to force for this IP Address (example when subnet CIDR address version changes)
 * @property {string} [cidrAddress] Value of IP Subnet CIDR - IP address will be constrained to same IP type/cidr range
 * @property {string} [cidrDefaultGateway] Value of IP Subnet Default Gateway - address will be used to constrain IP address (can't match)
 * @property {string} [cidrDhcpServer] Value of IP Subnet DHCP Server - address will be used to constrain IP address (can't match)
 * @property {string} [label] Label for displayed IP Address Field (which includes the CIDR)
 * @property {CidrRule} [cidrRule=CidrRule.Optional] Rule to follow for IP address CIDR entry
 * @property {boolean} [readOnly=false] Whether the component fields are read only
 * @property {boolean} [required=false] Whether the component fields are required
 * @property {string} [fieldRequiredMsg] Override the default fieldRequiredMessage
 * @property {(version: number) => void} [onAddressVersionChange] Function to call when address version is changed
 * @property {any} setValue Form function for updating form field value
 * @property {any} trigger Form trigger for initiating validation
 * @property {any} watch Form watch for tracking changes to form fields
 */
type tFieldProps = {
  clearedIpValue?: '' | null | undefined;
  control: any;
  errors: any;
  fullWidth?: boolean;
  infoText?: string | null;
  ipFieldName: string;
  addressVersions?: number[];
  cidrAddressVersion?: number;
  cidrAddress?: string;
  cidrDefaultGateway?: string;
  cidrDhcpServer?: string;
  label?: string;
  cidrRule?: CidrRule;
  readOnly?: boolean;
  required?: boolean;
  fieldRequiredMsg?: string;
  onAddressVersionChange?: (version: number) => void;
  setValue: (name: string, value: unknown, config?: Object) => void;
  trigger: (name?: string | string[]) => Promise<boolean>;
  watch: (names?: string | string[]) => unknown;
};
/**
 * Form Controlled Field for IP Address with display of IP combined with CIDR
 * @param tFieldProps props Field Component props
 * @returns {React.ReactElement}
 * Note: a manual value is set on "displayError_"+ ipFieldName so that the parent form
 * can do a yup validation to update isValid appropreiately for the form
 * -- example in form validationSchema:
 *  displayError_address: yup.boolean().oneOf([false],'hidden message'),// this is used inside the IP Address component so form knows if there's an error
 * For a nested ip field the "displayError_" is inserted after the final nested location (.)
 *  example: ipFieldName = config.ipName then display error "field" to validate is config.displayError_ipName
 * For an array of simple IP addresses (not nested) the error field will be "displayError_" followd by the field name
 *  example: ipFieldName = ip[0] then display error "field" to validate is a "separate" array of displayError_ip
 *    displayError_ip: yup.array().of(
 *      yup.boolean().oneOf([false],'hidden message'),// this is used inside the IP Address component so form knows if there's an error
 *    )
 */
export function FormControlIpField({
  clearedIpValue = ClearedIpValue.Undefined,
  control,
  errors,
  fullWidth = true,
  infoText = null,
  ipFieldName,
  addressVersions = defaultAddressVersions,
  cidrAddressVersion,
  cidrAddress,
  cidrDefaultGateway,
  cidrDhcpServer,
  label = 'IP',
  cidrRule = CidrRule.Optional,
  readOnly = false,
  required = false,
  fieldRequiredMsg = defaultFieldRequiredMsg,
  onAddressVersionChange,
  setValue,
  trigger,
  watch,
}: tFieldProps) {
  const focusHelper = useDisplayFocus();

  // to handle nested field need to split the field name and calculate displayErrorFieldName based on that
  // example: ipFieldName = config.ipName  => displayErrorFieldName = config.displayError_ipName
  let errorPrefix = '';
  let errorSuffix = ipFieldName;
  const nestedIpIndex = ipFieldName.lastIndexOf('.');
  if (nestedIpIndex > 0) {
    errorPrefix = ipFieldName.substring(0, nestedIpIndex + 1);
    errorSuffix = ipFieldName.substring(nestedIpIndex + 1);
  }
  const displayErrorFieldName = errorPrefix + 'displayError_' + errorSuffix;
  const watchIpAddress = watch(ipFieldName) as string;
  const [isInitialized, setIsInitialized] = useState(false);
  const [ipPlaceholder, setIpPlaceholder] = useState('');
  const [ipError, setIpError] = useState('');
  const [ipAddressVersion, setIpAddressVersion] =
    useState<IpAddressVersions | null>(cidrAddressVersion || null); // need to determine when address is actually loaded
  const cidrRange = useRef<string[]>([]);
  const cidrBase = useRef<string | null>(null);
  const cidrBaseTooltip = useRef('');

  const debugLog = (input1: string, input2: string, level?: number) => {
    if (level && level >= 1) {
      console.log(input1, input2);
    }
  };

  /**
   * Processes the user input
   * @param {string} input new input value
   */
  const handleUserInput = (input: string) => {
    validateInput(input, true);
  };

  /**
   * Cleans data for invalid characters and validates the address against addressVersion and cidrRule
   * - sets ipError accordingly
   * @param {string} input Input data to validate
   * @param {boolean} replaceChars Whether to replace (remove) invalid characters
   */
  const validateInput = (input: string, replaceChars: boolean) => {
    debugLog('input', input);
    if (input.length === 0) {
      setIpError(required ? fieldRequiredMsg : '');
      // clear the real address field and trigger validation
      setValue(ipFieldName, clearedIpValue);
      trigger(ipFieldName);
    } else {
      //clean entered data and trigger validation
      if (ipAddressVersion === IpAddressVersions.IPv6) {
        validateIPv6Address(input, replaceChars);
      } else {
        validateIPv4Address(input, replaceChars);
      }
    }
  };

  /**
   * Cleans data for invalid characters and validates the IPv4 address against cidrRule
   * - sets ipError accordingly
   * @param {string} input Input data to validate
   * @param {boolean} replaceChars Whether to replace (remove) invalid characters (example: "a" or ":")
   */
  const validateIPv4Address = (input: string, replaceChars?: boolean) => {
    const cleanInput = replaceChars ? input.replace(IPv4CharsRegex, '') : input;
    let ipError = '';
    if (cidrRule !== CidrRule.NotPermitted) {
      // first check for valid IP address with or without cidr suffix
      if (!ipv4OptionalCidrRegex.test(cleanInput)) {
        ipError = 'Invalid IPv4 address';
        // additionally check for cidr suffix if required
      } else if (
        cidrRule === CidrRule.Required &&
        !ipv4CidrRegex.test(cleanInput)
      ) {
        ipError = 'CIDR suffix required';
      }
    } else {
      // check that NO cidr suffix is included
      if (!ipv4Regex.test(cleanInput)) {
        if (cleanInput.indexOf('/') >= 0) {
          ipError = 'Invalid IPv4 address (no CIDR allowed)';
        } else {
          ipError =
            cidrAddress && cidrRange.current.length > 0
              ? `IP Address must be in range: ${cidrRange.current[0]} - ${cidrRange.current[1]}`
              : 'Invalid IPv4 address';
        }
      } else {
        // finally verify against cidr range of subnet if value is valid
        if (
          cidrAddress &&
          ipv4CidrRegex.test(cidrAddress) &&
          !containsCidr(cidrAddress, cleanInput)
        ) {
          ipError = `IP Address must be in range: ${cidrRange.current[0]} - ${cidrRange.current[1]}`;
        } else if (cidrDefaultGateway && cidrDefaultGateway === cleanInput) {
          ipError = 'IP address cannot match Default Gateway of IP Subnet';
        } else if (cidrDhcpServer && cidrDhcpServer === cleanInput) {
          ipError = 'IP address cannot match DHCP Server of IP Subnet';
        }
      }
    }
    setValue(ipFieldName, cleanInput);
    trigger(ipFieldName);
    setIpError(ipError);
  };

  /**
   * Cleans data for invalid characters and validates the IPv6 address against cidrRule
   * - sets ipError accordingly
   * @param {string} input Input data to validate
   * @param {boolean} replaceChars Whether to replace (remove) invalid characters (example: "x" or ".")
   */
  const validateIPv6Address = (input: string, replaceChars?: boolean) => {
    const cleanInput = replaceChars ? input.replace(IPv6CharsRegex, '') : input;
    let ipError = '';
    if (cidrRule !== CidrRule.NotPermitted) {
      // first check for valid IP address with or without cidr suffix
      if (!ipv6OptionalCidrRegex.test(cleanInput)) {
        ipError = 'Invalid IPv6 address';
        // additionally check for cidr suffix if required
      } else if (
        cidrRule === CidrRule.Required &&
        !ipv6CidrRegex.test(cleanInput)
      ) {
        ipError = 'CIDR suffix required';
      }
    } else {
      // check that NO cidr suffix is included
      if (!ipv6Regex.test(cleanInput)) {
        if (cleanInput.indexOf('/') >= 0) {
          ipError = 'Invalid IPv6 address (no CIDR allowed)';
        } else {
          ipError =
            cidrAddress && cidrRange.current.length > 0
              ? `IP Address must be in range: ${cidrRange.current[0]} - ${cidrRange.current[1]}`
              : 'Invalid IPv6 address';
        }
      } else {
        // finally verify against cidr range of subnet if value is valid
        if (
          cidrAddress &&
          ipv6CidrRegex.test(cidrAddress) &&
          !containsCidr(cidrAddress, cleanInput)
        ) {
          ipError = `IP Address must be in range: ${cidrRange.current[0]} - ${cidrRange.current[1]}`;
        } else if (cidrDefaultGateway && cidrDefaultGateway === cleanInput) {
          ipError = 'IP address cannot match Default Gateway of IP Subnet';
        } else if (cidrDhcpServer && cidrDhcpServer === cleanInput) {
          ipError = 'IP address cannot match DHCP Server of IP Subnet';
        }
      }
    }
    setValue(ipFieldName, cleanInput);
    trigger(ipFieldName);
    setIpError(ipError);
  };

  // One time setting display address based on db field values
  // also if parent clears the address field (example when one of multiple location fields is to be filled in)
  useEffect(() => {
    if (!isInitialized) {
      debugLog('stamp', '' + watchIpAddress);
      if (watchIpAddress) {
        // correctly initialize version if not passed in
        if (!cidrAddressVersion) {
          let addressVersion = IpAddressVersions.IPv4;
          if (watchIpAddress.includes(':')) {
            addressVersion = IpAddressVersions.IPv6;
          }
          setIpAddressVersion(addressVersion);
        }
      } else {
        // to catch "error" when IP is added to a simple array (example: GhostClient - nameservers)
        setIpError(required ? fieldRequiredMsg : '');
      }
      setIsInitialized(true);
    }
    if (isInitialized) {
      debugLog('stamp update', '' + watchIpAddress);
      if (!watchIpAddress) {
        setIpError(required ? fieldRequiredMsg : '');
      } else if (ipError === fieldRequiredMsg) {
        setIpError('');
      }
      // correctly initialize version if not passed in once ipAddress HAS been loaded
      if (!cidrAddressVersion && watchIpAddress && !ipAddressVersion) {
        let addressVersion = IpAddressVersions.IPv4;
        if (watchIpAddress.includes(':')) {
          addressVersion = IpAddressVersions.IPv6;
        }
        setIpAddressVersion(addressVersion);
      }
    }
  }, [watchIpAddress]);

  //Trigger validation when required changes
  useEffect(() => {
    if (isInitialized) {
      // set potential IP error for required field
      if (!watchIpAddress && required && !ipError) {
        setIpError(fieldRequiredMsg);
      } else if (!required && ipError === fieldRequiredMsg) {
        setIpError('');
      }
    }
  }, [required]);

  //Set up to trigger validation when cidr address version changes
  useEffect(() => {
    if (cidrAddressVersion) {
      setIpAddressVersion(cidrAddressVersion);
    }
  }, [cidrAddressVersion]);

  //Trigger validation when address version  or cidr associated address(es) change
  useEffect(() => {
    if (cidrAddress) {
      // get range for cidr for "hint" in field error
      const validCidr =
        cidrAddressVersion === IpAddressVersions.IPv4
          ? ipv4OptionalCidrRegex.test(cidrAddress) &&
            ipv4CidrRegex.test(cidrAddress)
          : ipv6OptionalCidrRegex.test(cidrAddress) &&
            ipv6CidrRegex.test(cidrAddress);

      if (validCidr) {
        const parsedCidr = parseCidr(cidrAddress);
        const cidrStart = stringifyIp({
          number: parsedCidr.start,
          version: parsedCidr.version,
        });
        const cidrEnd = stringifyIp({
          number: parsedCidr.end,
          version: parsedCidr.version,
        });
        cidrRange.current = [cidrStart, cidrEnd];

        // determine "common base" portion of cidr from range
        let i = 0;
        while (cidrStart[i] && cidrEnd[i]) i++;
        cidrBase.current = cidrStart.slice(0, i - 1);
        cidrBaseTooltip.current = `Insert ${cidrBase.current}`;
      } else {
        cidrRange.current = [];
        cidrBase.current = null;
        cidrBaseTooltip.current = '';
      }
    } else {
      // no cidr
      cidrRange.current = [];
      cidrBase.current = null;
      cidrBaseTooltip.current = '';
    }
    if (isInitialized && watchIpAddress) {
      debugLog('validate on type', watchIpAddress);
      validateInput(watchIpAddress, false);
    }
    if (ipAddressVersion === IpAddressVersions.IPv6) {
      setIpPlaceholder(ipv6Placeholder);
    } else {
      setIpPlaceholder(ipV4Placeholder);
    }
    // make sure ipAddressVersion HAS been initialized
    if (ipAddressVersion && onAddressVersionChange) {
      onAddressVersionChange(ipAddressVersion);
    }
  }, [
    isInitialized,
    ipAddressVersion,
    cidrAddress,
    cidrDefaultGateway,
    cidrDhcpServer,
  ]);

  // set or clear manual displayError field based on ipError changes
  useEffect(() => {
    // to force form to know whether there's an error on this field
    setValue(displayErrorFieldName, Boolean(ipError));
    trigger(displayErrorFieldName);
  }, [ipError]);

  const handleClearIpAddress = () => {
    setValue(ipFieldName, clearedIpValue);
    trigger(ipFieldName);
    setIpError(required ? fieldRequiredMsg : '');
  };

  const clearButton = (
    <InputAdornment position="end">
      <ButtonIcon
        id="clear-ip"
        name="Clear"
        props={{
          name: 'Clear',
          onClick: (event) => {
            event.stopPropagation();
            if (!readOnly) {
              handleClearIpAddress();
            }
          },
        }}
        tooltip="Clear"
        sxProps={{ marginLeft: '0px', marginRight: '0px' }}
      >
        <CloseIcon color="primary" fontSize="small" />
      </ButtonIcon>
    </InputAdornment>
  );

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ width: 'auto', paddingTop: '12px' }} // keep to accomodate textfield labe
    >
      {!readOnly && addressVersions.length > 1 && !cidrAddressVersion && (
        <Stack>
          <TextField
            select
            fullWidth={true}
            size="small"
            key="addressVersion"
            id={`${ipFieldName}_version`}
            data-testid={`${ipFieldName}_version`}
            name={`${ipFieldName}_version`}
            aria-label={`${ipFieldName}_version`}
            disabled={readOnly || Boolean(cidrAddress)}
            value={ipAddressVersion || ''} // may be null if not initialized yet
            onChange={(event: any) => {
              setIpAddressVersion(event.target.value);
            }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: {
                backgroundColor: (theme: any) => `${theme.input.fill}`,
              },
              inputProps: {
                'data-testid': 'field-' + ipFieldName + '-version',
              },
            }}
            sx={{
              borderRadius: '4px',
              width: '100%',
              padding: '0px',
              margin: '0px',
              minWidth: '76px',
            }}
          >
            {Object.values(IpAddressVersions)
              .filter(
                (value) => !isNaN(Number(IpAddressVersions[value as number])),
              )
              .map((key) => {
                const value = IpAddressVersions[key as number];
                // only display ones in address version list passed in
                if (addressVersions.indexOf(+value) > -1) {
                  return (
                    <MenuItem key={key} value={value}>
                      {key}
                    </MenuItem>
                  );
                } else {
                  return null;
                }
              })}
          </TextField>
        </Stack>
      )}
      {/* IP Address field displayed includes special error processing so it is handled separately */}
      {!readOnly ? (
        <TextField
          autoComplete="off"
          sx={{
            borderRadius: '4px',
            width: '440px', //must fit IPv6 with CIDR
          }}
          InputLabelProps={{ shrink: true }} // always put label above box even if empty
          InputProps={{
            endAdornment: watchIpAddress ? clearButton : null,
            sx: {
              backgroundColor: (theme: any) => `${theme.input.fill}`,
            },
            inputProps: {
              'data-testid': 'field-' + ipFieldName,
            },
          }}
          data-testid={ipFieldName}
          id={ipFieldName}
          aria-label={label}
          label={label}
          name={ipFieldName}
          value={watchIpAddress || ''}
          required={required}
          error={Boolean(ipError)}
          helperText={ipError}
          placeholder={ipPlaceholder}
          margin="dense"
          variant="outlined"
          fullWidth={fullWidth}
          size="small"
          spellCheck={false}
          onChange={(event) => {
            handleUserInput(event.target.value);
          }}
        />
      ) : (
        <ReadOnlyTextField
          fieldName={ipFieldName}
          fieldLabel={label}
          fieldValue={watchIpAddress || ''}
          props={{
            disabled: true,

            fullWidth: fullWidth,
          }}
          sxProps={{ width: '100%' }}
        />
      )}
      {infoText && <ButtonInfoField message={infoText} />}
      {cidrBase.current && !readOnly && (
        <ButtonIcon
          props={{
            onClick: (evt) => {
              evt.stopPropagation();
              validateInput(cidrBase.current || '', true); // '' so typescript is happy
              focusHelper.focusOnElementById(ipFieldName);
            },
          }}
          tooltip={cidrBaseTooltip.current}
        >
          <AssignmentReturnIcon sx={{ marginTop: '4px' }} />
        </ButtonIcon>
      )}
    </Stack>
  );
}

export default FormControlIpField;
