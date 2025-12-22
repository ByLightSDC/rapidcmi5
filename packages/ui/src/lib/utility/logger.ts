import { config } from '@rapid-cmi5/ui';
export const debugColorSuccess = 'background:lightgreen';
export const debugColor2 = 'background:lightblue';
export const debugColor3 = 'background:lightgrey';
export const debugColorWarning = 'background:lightyellow';
export const debugColorError = 'background:lightred';
const currentMinLogLevel = config.CLIENT_LOG ? 0 : -1;
//REF console.log('Client log Level', currentMinLogLevel);
export const debugLogError = (m1: string) => {
  if (currentMinLogLevel >= 0) {
    console.log('%c ' + m1, debugColorError);
  }
};

export const debugLogSuccess = (m1: string) => {
  if (currentMinLogLevel >= 0) {
    console.log('%c ' + m1, debugColorSuccess);
  }
};

export const debugLogWarning = (m1: string) => {
  if (currentMinLogLevel >= 0) {
    console.log('%c ' + m1, debugColorWarning);
  }
};

export const debugLog = (m1?: string, m2?: any, p?: number) => {
  if (currentMinLogLevel >= 0) {
    //0 no color, 1 color
    if (typeof m2 !== 'undefined') {
      if (typeof m2 === 'number') {
        if (p) {
          if (p >= currentMinLogLevel) {
            console.log('log => ' + m1, m2);
          }
        } else {
          //asume m2 is the priority
          if (m2 >= currentMinLogLevel) {
            console.log('%c ' + m1, debugColor2);
          }
        }
      } else {
        if (p) {
          if (p >= currentMinLogLevel) {
            console.log('%c ' + m1, m2);
          }
        } else {
          //console.log(m1, m2);
          //TEMP to prove using debugLog
          console.log('log => ' + m1, m2);
        }
      }
    } else {
      //console.log(m1);
      //TEMP to prove using debugLog
      console.log('%c ' + m1, debugColor3);
    }
  }
};

export const debugLogObj = (m1: any) => {
  if (currentMinLogLevel >= 0) {
    console.log(m1);
  }
};
