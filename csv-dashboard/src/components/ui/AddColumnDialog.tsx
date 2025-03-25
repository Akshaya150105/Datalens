// components/ui/AddColumnDialog.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AddColumnDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  numericColumns: string[];
  onAddColumn: (newColumnName: string, column1: string, column2: string, operation: "+" | "-" | "*" | "/") => void;
}

export const AddColumnDialog = ({ isOpen, onOpenChange, numericColumns, onAddColumn }: AddColumnDialogProps) => {
  const [newColumnName, setNewColumnName] = useState("");
  const [column1, setColumn1] = useState<string | null>(null);
  const [column2, setColumn2] = useState<string | null>(null);
  const [operation, setOperation] = useState<"+" | "-" | "*" | "/">("+");

  const handleAdd = () => {
    if (!newColumnName || !column1 || !column2) return;
    onAddColumn(newColumnName, column1, column2, operation);
    setNewColumnName("");
    setColumn1(null);
    setColumn2(null);
    setOperation("+");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
          <DialogDescription>
            Create a new column by performing a calculation on existing numeric columns.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="New column name (e.g., FamilySize)"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
          />
          <Select onValueChange={setColumn1}>
            <SelectTrigger>
              <SelectValue placeholder="Select first column" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((col) => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value: "+" | "-" | "*" | "/") => setOperation(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+">+</SelectItem>
              <SelectItem value="-">-</SelectItem>
              <SelectItem value="*">×</SelectItem>
              <SelectItem value="/">÷</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setColumn2}>
            <SelectTrigger>
              <SelectValue placeholder="Select second column" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((col) => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} disabled={!newColumnName || !column1 || !column2}>
            Add Column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};