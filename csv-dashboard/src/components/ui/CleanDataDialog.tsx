// components/ui/CleanDataDialog.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CleanDataDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  numericColumns: string[];
  onCleanData: (column: string, fillMethod: "mean" | "median" | "custom", customFillValue: string) => void;
}

export const CleanDataDialog = ({ isOpen, onOpenChange, numericColumns, onCleanData }: CleanDataDialogProps) => {
  const [cleanColumn, setCleanColumn] = useState<string | null>(null);
  const [fillMethod, setFillMethod] = useState<"mean" | "median" | "custom">("mean");
  const [customFillValue, setCustomFillValue] = useState<string>("");

  const handleClean = () => {
    if (!cleanColumn) return;
    onCleanData(cleanColumn, fillMethod, customFillValue);
    setCleanColumn(null);
    setFillMethod("mean");
    setCustomFillValue("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clean Data</DialogTitle>
          <DialogDescription>
            Handle missing values in numeric columns.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select onValueChange={setCleanColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Select column to clean" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((col) => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value: "mean" | "median" | "custom") => setFillMethod(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Fill method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mean">Mean</SelectItem>
              <SelectItem value="median">Median</SelectItem>
              <SelectItem value="custom">Custom Value</SelectItem>
            </SelectContent>
          </Select>
          {fillMethod === "custom" && (
            <Input
              type="number"
              placeholder="Custom fill value"
              value={customFillValue}
              onChange={(e) => setCustomFillValue(e.target.value)}
            />
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleClean} disabled={!cleanColumn}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};