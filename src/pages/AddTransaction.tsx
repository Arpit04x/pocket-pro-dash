import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFinance } from "@/contexts/FinanceContext";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const AddTransaction = () => {
  const navigate = useNavigate();
  const { addTransaction } = useFinance();
  
  const [formData, setFormData] = useState({
    type: "" as "income" | "expense" | "",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const incomeCategories = [
    "Salary",
    "Freelance",
    "Investment",
    "Business",
    "Gift",
    "Other Income",
  ];

  const expenseCategories = [
    "Rent",
    "Groceries",
    "Utilities",
    "Transportation",
    "Entertainment",
    "Healthcare",
    "Shopping",
    "Dining Out",
    "Insurance",
    "Education",
    "Other Expense",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.amount || !formData.category || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    addTransaction({
      type: formData.type,
      amount,
      category: formData.category,
      description: formData.description || `${formData.type} - ${formData.category}`,
      date: formData.date,
    });

    toast.success(`${formData.type === "income" ? "Income" : "Expense"} added successfully!`);
    
    // Reset form
    setFormData({
      type: "" as "income" | "expense" | "",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset category when type changes
      ...(field === "type" && { category: "" })
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        <h1 className="text-2xl font-bold">Add New Transaction</h1>
      </div>

      <Card variant="modern">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                disabled={!formData.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === "income" ? incomeCategories : expenseCategories).map(
                    (category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a description for this transaction (optional)"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={!formData.type || !formData.amount || !formData.category}
              >
                Add {formData.type ? (formData.type === "income" ? "Income" : "Expense") : "Transaction"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Add Buttons */}
      <Card variant="modern">
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() => {
                setFormData({
                  type: "income",
                  amount: "",
                  category: "Salary",
                  description: "Monthly salary",
                  date: new Date().toISOString().split("T")[0],
                });
              }}
            >
              <div>
                <div className="font-medium text-income">Monthly Salary</div>
                <div className="text-sm text-muted-foreground">Quick add income</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() => {
                setFormData({
                  type: "expense",
                  amount: "",
                  category: "Groceries",
                  description: "Grocery shopping",
                  date: new Date().toISOString().split("T")[0],
                });
              }}
            >
              <div>
                <div className="font-medium text-expense">Groceries</div>
                <div className="text-sm text-muted-foreground">Quick add expense</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTransaction;