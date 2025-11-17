import { createContext, useState } from 'react';

/**
 * @interface iFormContext properties available from FormControlUIContext
 * @property {any} formMethods set of Form Methods from useForm
 * @property {(formMethods: any) => void} setFormMethods function to set the form methods in context
 * @property {boolean} isContextSet Whether form methods have been set (replacing the placeholder methods)
 */
interface iFormContext {
  formMethods: any;
  setFormMethods: (formMethods: any) => void;
  isContextSet: boolean;
}

/** @constant
 * Context for managing form methods and basic parameters
 *  @type {React.Context<iFormContext>}
 */
export const FormControlUIContext = createContext<iFormContext>(
  {} as iFormContext, // this allows us to create the context without having to default values
);

/**
 * @interface tProviderProps Props to be defined when rendering the Provider for FormControlUIContext
 * @property {*} [children] Children
 */
interface tProviderProps {
  children?: any;
}

/**
 * React context for dynamic property selection including
 *    handle selection modals
 * @param {tProviderProps} props Component props
 * @return {JSX.Element} React context
 */
export const FormControlUIProvider: any = (props: tProviderProps) => {
  const { children } = props;
  const [isInitialized, setInitialized] = useState(false);
  // initialize with placeholder methods
  const [methods, setMethods] = useState<any>({
    control: () => {
      return null;
    },
    clearErrors: () => {
      return;
    },
    setError: () => {
      return;
    },
    handleSubmit: () => {
      return;
    },
    reset: () => {
      return;
    },
    getValues: () => {
      return {};
    },
    setValue: () => {
      return;
    },
    trigger: () => {
      return;
    },
    watch: () => {
      return '';
    },
  });
  const setFormMethods = (formMethods: any) => {
    setMethods(formMethods);
    setInitialized(true);
  };

  return (
    <FormControlUIContext.Provider
      value={{
        formMethods: methods,
        setFormMethods: setFormMethods,
        isContextSet: isInitialized,
      }}
    >
      {children}
    </FormControlUIContext.Provider>
  );
};
