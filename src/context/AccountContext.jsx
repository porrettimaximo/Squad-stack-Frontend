import React, { createContext, useState, useEffect, useCallback } from "react";
import accountService from "../services/accountService";
import authService from "../services/authService";

export const AccountContext = createContext(null);

/**
 * Proveedor de contexto global de cuenta bancaria.
 * Mantiene sincronizado el saldo (money), información de tarjeta y estado
 * en todas las vistas de la aplicación (Dashboard, Depósito, etc.).
 */
export function AccountProvider({ children }) {
  const [account, setAccount] = useState({
    money: 45230.50,
    cardNumber: "4892",
    trend: 2.4,
    isBlocked: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.ensureAuth();
      const data = await accountService.getMyAccount();
      if (data) {
        setAccount((prev) => ({
          ...prev,
          money: data.money ?? prev.money,
          cardNumber: data.cardNumber || prev.cardNumber,
          trend: data.trend ?? prev.trend,
          isBlocked: data.isBlocked ?? prev.isBlocked,
        }));
      }
      return data;
    } catch (err) {
      console.error("Error al refrescar cuenta:", err);
      setError("No se pudo sincronizar la cuenta con el servidor.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccount();
  }, [refreshAccount]);

  /**
   * Actualiza el saldo de manera inmediata (ej. tras un depósito o transferencia exitosa).
   * @param {number} newBalance - Nuevo saldo reportado por la API.
   */
  const updateBalance = useCallback((newBalance) => {
    if (typeof newBalance === "number" && !isNaN(newBalance)) {
      setAccount((prev) => ({
        ...prev,
        money: newBalance,
      }));
    }
  }, []);

  return (
    <AccountContext.Provider
      value={{
        account,
        setAccount,
        loading,
        error,
        refreshAccount,
        updateBalance,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export default AccountContext;
