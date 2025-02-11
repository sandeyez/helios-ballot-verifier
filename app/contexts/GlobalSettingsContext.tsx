import { createContext, ReactNode, useContext, useState } from "react";

type GlobalSettingsContextValue = {
  ballotLength: number;
};

const GlobalSettingsContext = createContext<GlobalSettingsContextValue>(
  {} as GlobalSettingsContextValue
);

export const useGlobalSettings = () => useContext(GlobalSettingsContext);

type GlobalSettingsContextProviderProps = {
  children: ReactNode;
  ballotLength: number;
};

/**
 * Context that provides the ballot length throughout the application.
 *
 * @param ballotLength The length of the ballot ID.
 * @param children The children components that will have access to the context.
 */
function GlobalSettingsContextProvider({
  children,
  ballotLength,
}: GlobalSettingsContextProviderProps): JSX.Element {
  return (
    <GlobalSettingsContext.Provider value={{ ballotLength }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export default GlobalSettingsContextProvider;
