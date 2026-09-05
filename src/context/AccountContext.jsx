import React, { createContext, useState, useCallback, useEffect } from "react";
import accountService from "../services/accountService";
import transactionService from "../services/transactionService";
import userService from "../services/userService";
import { useAuth } from "./AuthContext";

export const AccountContext = createContext(null);

const INITIAL_USER = {
  name: "Alejandro Silva",
  firstName: "Alejandro",
  lastName: "Silva",
  email: "alejandro.silva@digitalars.com",
  role: "User",
  cardNumber: "4892",
};

const INITIAL_ACCOUNT = {
  money: 0,
  cardNumber: "4892",
  trend: 0,
  isBlocked: false,
};

/**
 * Proveedor de contexto global de cuenta y transacciones.
 * Se sincroniza de forma inmediata al cambiar el usuario o token en AuthContext.
 */
export function AccountProvider({ children }) {
  const { token, user: authUser } = useAuth();

  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...INITIAL_USER,
          ...parsed,
          name: parsed.name || `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() || parsed.email || INITIAL_USER.name,
        };
      }
    } catch {}
    return INITIAL_USER;
  });

  const [account, setAccount] = useState(INITIAL_ACCOUNT);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sincronización del perfil propio del usuario autenticado (/users/me)
  const refreshUserProfile = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setUser(INITIAL_USER);
      return;
    }

    try {
      const data = await userService.getMyProfile();
      if (data) {
        setUser((prev) => {
          const firstName = data.firstName || prev.firstName || "";
          const lastName = data.lastName || prev.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim() || data.email || prev.name;
          const updated = {
            ...prev,
            id: data.id,
            firstName,
            lastName,
            name: fullName,
            email: data.email || prev.email,
            role: data.role || prev.role || "User",
            createdAt: data.createdAt,
            isActive: data.isActive,
          };
          try {
            localStorage.setItem("user", JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch {
      // Modo autónomo / offline: preserva el estado en memoria
    }
  }, []);

  /**
   * Actualiza los datos del usuario en memoria y en localStorage de forma reactiva inmediata.
   */
  const updateUserProfile = useCallback((updatedData) => {
    if (!updatedData) return;
    setUser((prev) => {
      const firstName = updatedData.firstName !== undefined ? updatedData.firstName : (prev.firstName || "");
      const lastName = updatedData.lastName !== undefined ? updatedData.lastName : (prev.lastName || "");
      const fullName = `${firstName} ${lastName}`.trim() || prev.name;
      const updated = {
        ...prev,
        ...updatedData,
        firstName,
        lastName,
        name: fullName,
      };
      try {
        localStorage.setItem("user", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Sincronización silenciosa con el backend si está activo
  const refreshAccount = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setAccount(INITIAL_ACCOUNT);
      return;
    }

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
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setTransactions([]);
      return;
    }

    try {
      const txs = await transactionService.getRecentTransactions(5);
      setTransactions(txs || []);
    } catch {
      setTransactions([]);
    }
  }, []);

  // Carga y reseteo reactivo cada vez que cambia el token o usuario autenticado
  useEffect(() => {
    if (token) {
      // Actualizar inmediatamente con los datos básicos de la sesión actual
      if (authUser) {
        setUser((prev) => ({
          ...prev,
          id: authUser.id,
          email: authUser.email,
          role: authUser.role,
          name: authUser.email ? authUser.email.split("@")[0] : prev.name,
        }));
      }
      refreshUserProfile();
      refreshAccount();
      refreshTransactions();
    } else {
      setUser(INITIAL_USER);
      setAccount(INITIAL_ACCOUNT);
      setTransactions([]);
    }
  }, [token, authUser?.id, refreshUserProfile, refreshAccount, refreshTransactions]);

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
      subtitle: `Hoy ${timeStr} · DEPÓSITO`,
      amount: num,
      type: 1,
      category: "DEPÓSITO",
      isIncome: true,
      date: now.toISOString(),
      counterpart: "Cuenta Propia (CVU)",
      status: "Completada",
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
      date: now.toISOString(),
      counterpart: destination,
      status: "Completada",
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
        refreshUserProfile,
        updateUserProfile,
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
