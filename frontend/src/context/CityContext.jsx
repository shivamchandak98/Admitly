import { createContext, useContext, useEffect, useState } from "react";

const KEY = "admitly_city";
const DEFAULT_CITY = "Mumbai";

const CityContext = createContext(null);

export function CityProvider({ children }) {
  const [city, setCityState] = useState(() => localStorage.getItem(KEY) || DEFAULT_CITY);

  useEffect(() => {
    localStorage.setItem(KEY, city);
  }, [city]);

  const setCity = (c) => setCityState(c);
  return <CityContext.Provider value={{ city, setCity }}>{children}</CityContext.Provider>;
}

export const useCity = () => useContext(CityContext);
