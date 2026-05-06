import { createContext, useContext } from 'react';

type TermsAcceptanceContextValue = {
  hasAcceptedTerms: boolean;
  setHasAcceptedTerms: (hasAcceptedTerms: boolean) => void;
};

export const hasAcceptedTermsStorageKey = 'hasAcceptedTerms';

export const TermsAcceptanceContext =
  createContext<TermsAcceptanceContextValue>({
    hasAcceptedTerms: false,
    setHasAcceptedTerms: () => {},
  });

export const useTermsAcceptance = () => useContext(TermsAcceptanceContext);
