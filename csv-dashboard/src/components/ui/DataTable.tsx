import { useState, useMemo, useRef } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SortAsc, SortDesc, Eye, EyeOff } from "lucide-react";
import { Resizable } from "re-resizable";

type DataRow = Record<string, any>;

interface DataTableProps {
  data: DataRow[];
  columnKeys: string[];
  sortConfig: { key: string | null; direction: "asc" | "desc" };
  onSort: (key: string) => void;
  onDataChange: (newData: DataRow[]) => void;
  outlierRows?: number[]; // Add outlierRows prop to the interface
}

export const DataTable = ({ data, columnKeys, sortConfig, onSort, onDataChange, outlierRows = [] }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columnKeys.reduce((acc, key) => ({ ...acc, [key]: 150 }), {})
  );

  // Pagination logic
  const totalRows = data.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, rowsPerPage]);

  // Adjust outlier row indices for the current page
  const adjustedOutlierRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return outlierRows
      .filter((globalIndex) => globalIndex >= startIndex && globalIndex < startIndex + rowsPerPage)
      .map((globalIndex) => globalIndex - startIndex);
  }, [outlierRows, currentPage, rowsPerPage]);

  // Toggle column visibility
  const toggleColumnVisibility = (colKey: string) => {
    setHiddenColumns((prev) =>
      prev.includes(colKey) ? prev.filter((key) => key !== colKey) : [...prev, colKey]
    );
  };

  // Handle column resize
  const handleResize = (colKey: string, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [colKey]: width }));
  };

  // Handle inline editing
  const startEditing = (rowIndex: number, colKey: string, value: any) => {
    setEditingCell({ rowIndex, colKey });
    setEditValue(String(value ?? ""));
  };

  const saveEdit = (rowIndex: number) => {
    if (!editingCell) return;

    const newData = [...data];
    const globalRowIndex = (currentPage - 1) * rowsPerPage + rowIndex;
    newData[globalRowIndex][editingCell.colKey] = editValue;
    onDataChange(newData);
    setEditingCell(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex justify-between items-center">
        {/* Rows per page selector */}
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Column visibility toggles */}
        <div className="flex flex-wrap gap-2">
          {columnKeys.map((col) => (
            <Button
              key={col}
              variant="outline"
              size="sm"
              onClick={() => toggleColumnVisibility(col)}
              className={hiddenColumns.includes(col) ? "bg-gray-200" : ""}
            >
              {hiddenColumns.includes(col) ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
              {col}
            </Button>
          ))}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columnKeys
                .filter((col) => !hiddenColumns.includes(col))
                .map((col) => (
                  <TableHead
                    key={col}
                    onClick={() => onSort(col)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <Resizable
                      size={{ width: columnWidths[col], height: "auto" }}
                      onResizeStop={(e, direction, ref, d) => {
                        handleResize(col, columnWidths[col] + d.width);
                      }}
                      enable={{ right: true }}
                      minWidth={100}
                    >
                      <div className="flex items-center justify-between p-2">
                        {col}
                        {sortConfig.key === col && (
                          sortConfig.direction === "asc" ? (
                            <SortAsc size={16} className="text-gray-500" />
                          ) : (
                            <SortDesc size={16} className="text-gray-500" />
                          )
                        )}
                      </div>
                    </Resizable>
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={adjustedOutlierRows.includes(rowIndex) ? "bg-yellow-100" : ""}
              >
                {columnKeys
                  .filter((col) => !hiddenColumns.includes(col))
                  .map((col) => (
                    <TableCell key={col} style={{ width: columnWidths[col] }}>
                      {editingCell?.rowIndex === rowIndex && editingCell?.colKey === col ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(rowIndex);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => saveEdit(rowIndex)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div
                          onDoubleClick={() => startEditing(rowIndex, col, row[col])}
                          className="cursor-pointer"
                        >
                          {row[col] ?? "N/A"}
                        </div>
                      )}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};