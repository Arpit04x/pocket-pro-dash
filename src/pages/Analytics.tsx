import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Analytics = () => {
  const { transactions } = useFinance();
  const [timeFilter, setTimeFilter] = useState("all");

  const filteredTransactions = useMemo(() => {
    if (timeFilter === "all") return transactions;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case "30days":
        filterDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        filterDate.setDate(now.getDate() - 90);
        break;
      case "6months":
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(t => new Date(t.date) >= filterDate);
  }, [transactions, timeFilter]);

  const analytics = useMemo(() => {
    const incomeTransactions = filteredTransactions.filter(t => t.type === "income");
    const expenseTransactions = filteredTransactions.filter(t => t.type === "expense");
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Category breakdown
    const incomeByCategory = incomeTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const expensesByCategory = expenseTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Monthly breakdown
    const monthlyData = filteredTransactions.reduce((acc, t) => {
      const monthKey = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0 };
      }
      acc[monthKey][t.type === "income" ? "income" : "expenses"] += t.amount;
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);
    
    // Average transaction amounts
    const avgIncome = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0;
    const avgExpense = expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0;
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeByCategory,
      expensesByCategory,
      monthlyData,
      avgIncome,
      avgExpense,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatMonth = (monthKey: string) => {
    return new Date(monthKey + "-01").toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Analytics</h1>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.transactionCount}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="bg-income">
                {filteredTransactions.filter(t => t.type === "income").length} income
              </Badge>
              <Badge variant="destructive" className="bg-expense">
                {filteredTransactions.filter(t => t.type === "expense").length} expense
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.balance >= 0 ? "text-income" : "text-expense"}`}>
              {formatCurrency(analytics.balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.balance >= 0 ? "Positive" : "Negative"} cash flow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              {formatCurrency(analytics.avgIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
              {formatCurrency(analytics.avgExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.incomeByCategory).length > 0 ? (
                Object.entries(analytics.incomeByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = analytics.totalIncome > 0 ? (amount / analytics.totalIncome) * 100 : 0;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(amount)} ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-income rounded-full h-2 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No income data for selected period
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.expensesByCategory).length > 0 ? (
                Object.entries(analytics.expensesByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = analytics.totalExpenses > 0 ? (amount / analytics.totalExpenses) * 100 : 0;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(amount)} ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-expense rounded-full h-2 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No expense data for selected period
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.monthlyData).length > 0 ? (
              Object.entries(analytics.monthlyData)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, data]) => (
                  <div key={month} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">{formatMonth(month)}</h3>
                      <div className="text-sm text-muted-foreground">
                        Net: <span className={`font-medium ${(data.income - data.expenses) >= 0 ? "text-income" : "text-expense"}`}>
                          {formatCurrency(data.income - data.expenses)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-income/10 rounded">
                        <div className="text-sm text-muted-foreground">Income</div>
                        <div className="text-lg font-semibold text-income">
                          {formatCurrency(data.income)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-expense/10 rounded">
                        <div className="text-sm text-muted-foreground">Expenses</div>
                        <div className="text-lg font-semibold text-expense">
                          {formatCurrency(data.expenses)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No monthly data for selected period
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;