import React, { createContext, useContext, useState, useEffect } from "react";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

// Sample data for demo
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 5000,
    category: "Salary",
    description: "Monthly salary",
    date: "2024-01-15",
  },
  {
    id: "2",
    type: "expense",
    amount: 1200,
    category: "Rent",
    description: "Monthly rent payment",
    date: "2024-01-01",
  },
  {
    id: "3",
    type: "expense",
    amount: 400,
    category: "Groceries",
    description: "Weekly grocery shopping",
    date: "2024-01-10",
  },
  {
    id: "4",
    type: "income",
    amount: 500,
    category: "Freelance",
    description: "Website project",
    date: "2024-01-20",
  },
  {
    id: "5",
    type: "expense",
    amount: 80,
    category: "Utilities",
    description: "Electricity bill",
    date: "2024-01-05",
  },
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Load from localStorage or use sample data
    const saved = localStorage.getItem("finance-transactions");
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      setTransactions(sampleTransactions);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever transactions change
    localStorage.setItem("finance-transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getTotalIncome = () => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        getTotalIncome,
        getTotalExpenses,
        getBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};