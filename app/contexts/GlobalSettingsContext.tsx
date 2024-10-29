import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type GlobalSettingsContextValue = {
  setBallotLength: (value: number) => void;
  ballotLength: number;
};

const GlobalSettingsContext = createContext<GlobalSettingsContextValue>(
  {} as GlobalSettingsContextValue
);

export const useGlobalSettings = () => useContext(GlobalSettingsContext);

function GlobalSettingsContextProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [ballotLength, setBallotLength] = useState<number>(2);

  return (
    <GlobalSettingsContext.Provider value={{ ballotLength, setBallotLength }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export default GlobalSettingsContextProvider;
