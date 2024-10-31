import { createContext, ReactNode, useContext, useState } from "react";

type GlobalSettingsContextValue = {
  setBallotLength: (value: number) => void;
  ballotLength: number;
};

const GlobalSettingsContext = createContext<GlobalSettingsContextValue>(
  {} as GlobalSettingsContextValue
);

export const useGlobalSettings = () => useContext(GlobalSettingsContext);

type GlobalSettingsContextProviderProps = {
  children: ReactNode;
  initialBallotLength: number;
};

function GlobalSettingsContextProvider({
  children,
  initialBallotLength,
}: GlobalSettingsContextProviderProps): JSX.Element {
  const [ballotLength, setBallotLength] = useState<number>(initialBallotLength);

  return (
    <GlobalSettingsContext.Provider value={{ ballotLength, setBallotLength }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export default GlobalSettingsContextProvider;
