import { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TAU_TO_USD = 2;

const CURRENCY_RATES: Record<string, { rate: number; symbol: string; name: string }> = {
  USD: { rate: 1, symbol: "$", name: "US Dollar" },
  EUR: { rate: 0.92, symbol: "€", name: "Euro" },
  GBP: { rate: 0.79, symbol: "£", name: "British Pound" },
  JPY: { rate: 149.50, symbol: "¥", name: "Japanese Yen" },
  CAD: { rate: 1.36, symbol: "C$", name: "Canadian Dollar" },
  AUD: { rate: 1.53, symbol: "A$", name: "Australian Dollar" },
  CHF: { rate: 0.88, symbol: "Fr", name: "Swiss Franc" },
  CNY: { rate: 7.24, symbol: "¥", name: "Chinese Yuan" },
  INR: { rate: 83.12, symbol: "₹", name: "Indian Rupee" },
  NGN: { rate: 1550, symbol: "₦", name: "Nigerian Naira" },
  ZAR: { rate: 18.50, symbol: "R", name: "South African Rand" },
  BRL: { rate: 4.97, symbol: "R$", name: "Brazilian Real" },
  MXN: { rate: 17.15, symbol: "$", name: "Mexican Peso" },
  KRW: { rate: 1320, symbol: "₩", name: "South Korean Won" },
  SGD: { rate: 1.34, symbol: "S$", name: "Singapore Dollar" },
};

export const TauConverter = () => {
  const [tauAmount, setTauAmount] = useState<string>("100");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

  const numericTau = parseFloat(tauAmount) || 0;
  const usdValue = numericTau * TAU_TO_USD;
  const currencyData = CURRENCY_RATES[selectedCurrency];
  const convertedValue = usdValue * currencyData.rate;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">TAU Converter</h3>
          <p className="text-sm text-muted-foreground">1 TAU = $2.00 USD</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tau-amount">TAU Amount</Label>
          <Input
            id="tau-amount"
            type="number"
            min="0"
            step="0.01"
            value={tauAmount}
            onChange={(e) => setTauAmount(e.target.value)}
            placeholder="Enter TAU amount"
          />
        </div>

        <div className="flex items-center justify-center py-2">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Convert To</Label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCY_RATES).map(([code, data]) => (
                <SelectItem key={code} value={code}>
                  {code} - {data.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">USD Value:</span>
            <span className="font-medium text-foreground">
              ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{selectedCurrency} Value:</span>
            <span className="font-semibold text-lg text-foreground">
              {currencyData.symbol}
              {convertedValue.toLocaleString(undefined, { 
                minimumFractionDigits: selectedCurrency === "JPY" || selectedCurrency === "KRW" ? 0 : 2, 
                maximumFractionDigits: selectedCurrency === "JPY" || selectedCurrency === "KRW" ? 0 : 2 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
