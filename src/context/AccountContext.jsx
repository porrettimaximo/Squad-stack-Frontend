import React, { createContext, useState, useCallback, useEffect } from "react";
import accountService from "../services/accountService";
import transactionService from "../services/transactionService";

export const AccountContext = createContext(null);

const INITIAL_USER = {
  name: "Alejandro Silva",
  email: "alejandro.silva@digitalars.com",
  cardNumber: "4892",
};

const INITIAL_ACCOUNT = {
  money: 45230.50,
  cardNumber: "4892",
  trend: 2.4,
  isBlocked: false,
};

/**
 * Proveedor de contexto global de cuenta y transacciones.
 * Funciona de forma 100% autónoma en memoria con datos de Figma, y
 * se sincroniza con el backend cuando esté disponible con sesión activa.
 */
export function AccountProvider({ children }) {
  const [user, setUser] = useState(INITIAL_USER);
  const [account, setAccount] = useState(INITIAL_ACCOUNT);
  const [transactions, setTransactions] = useState(() => transactionService.getDemoTransactions());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sincronización silenciosa con el backend si está activo
  const refreshAccount = useCallback(async () => {
    try {
      const data = await accountService.getMyAccount();
      if (data && data.money !== undefined) {
        setAccount((prev) => ({
          ...prev,
          money: data.money,
          cardNumber: data.cardNumber || prev.cardNumber,
          trend: data.trend ?? prev.trend,
          isBlocked: data.isBlocked ?? prev.isBlocked,
        }));
      }
    } catch {
      // Modo autónomo / offline: preserva el estado en memoria
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    try {
      const txs = await transactionService.getRecentTransactions(5);
      if (txs && txs.length > 0) {
        setTransactions(txs);
      }
    } catch {
      // Modo autónomo / offline: preserva transacciones
    }
  }, []);

  /**
   * Actualiza el saldo en memoria de inmediato.
   */
  const updateBalance = useCallback((newBalance) => {
    if (typeof newBalance === "number" && !isNaN(newBalance)) {
      setAccount((prev) => ({
        ...prev,
        money: newBalance,
      }));
    }
  }, []);

  /**
   * Realiza un depósito (autónomo y reactivo).
   */
  const depositFunds = useCallback(async (amount) => {
    const num = Number(amount);
    if (!num || num <= 0) throw new Error("El monto debe ser mayor a 0.");

    let newBalance = account.money + num;
    try {
      const res = await accountService.deposit(num);
      if (res?.newBalance !== undefined) {
        newBalance = res.newBalance;
      }
    } catch {
      // Backend no disponible: se aplica de forma local
    }

    setAccount((prev) => ({ ...prev, money: newBalance }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newTx = {
      id: Date.now(),
      title: "Depósito de Fondos",
      subtitle: `Hoy ${timeStr} · INGRESO`,
      amount: num,
      type: 1,
      category: "INGRESO",
      isIncome: true,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, newBalance };
  }, [account.money]);

  /**
   * Realiza una transferencia (autónoma y reactiva).
   */
  const transferFunds = useCallback(async ({ destination, amount, concept }) => {
    const num = Number(amount);
    if (!num || num <= 0) throw new Error("El monto debe ser mayor a 0.");
    if (num > account.money) throw new Error("El monto supera tu saldo disponible.");

    let newBalance = account.money - num;
    try {
      await transactionService.transfer({ destination, amount: num, concept });
    } catch {
      // Backend no disponible: se aplica de forma local
    }

    setAccount((prev) => ({ ...prev, money: newBalance }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newTx = {
      id: Date.now(),
      title: concept || `Transferencia a ${destination}`,
      subtitle: `Hoy ${timeStr} · EGRESO`,
      amount: num,
      type: 3,
      category: "EGRESO",
      isIncome: false,
      toAccountId: destination,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, newBalance };
  }, [account.money]);

  return (
    <AccountContext.Provider
      value={{
        user,
        setUser,
        account,
        setAccount,
        transactions,
        setTransactions,
        loading,
        error,
        refreshAccount,
        refreshTransactions,
        updateBalance,
        depositFunds,
        transferFunds,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export default AccountContext;
