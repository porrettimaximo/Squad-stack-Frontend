import { useContext } from "react";
import AccountContext from "../context/AccountContext";

/**
 * Hook personalizado para acceder al estado y acciones globales de la cuenta bancaria.
 */
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount debe ser utilizado dentro de un AccountProvider");
  }
  return context;
}

export default useAccount;
