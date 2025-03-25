import { useState, useEffect, useMemo, useCallback } from "react";
import { useFile } from "../context/FileContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartComponent, LineChartComponent, PieChartComponent, ScatterChartComponent, BoxPlotComponent, AreaChartComponent, isLineChartSupported, isPieChartSupported, isScatterChartSupported, isBoxPlotSupported, isAreaChartSupported } from "@/components/ui/charts";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Filter, 
  Download, 
  RefreshCw, 
  Filter as FilterIcon,
  Plus,
  Wrench,
  ZoomIn,
  HelpCircle,
} from "lucide-react";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { AddColumnDialog } from "@/components/ui/AddColumnDialog";
import { CleanDataDialog } from "@/components/ui/CleanDataDialog";
import { DataTable } from "@/components/ui/DataTable";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type DataRow = Record<string, any>;

const Dashboard = () => {
  const { data } = useFile();
  const [filteredData, setFilteredData] = useState<DataRow[]>(data);
  const [transformedData, setTransformedData] = useState<DataRow[]>(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [xKey, setXKey] = useState<string | null>(null);
  const [yKey, setYKey] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [advancedFilters, setAdvancedFilters] = useState<{[key: string]: string}>({});
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [isCleanDataDialogOpen, setIsCleanDataDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [zoomDomains, setZoomDomains] = useState<Record<string, { start: number; end: number } | null>>({
    bar: null,
    line: null,
    scatter: null,
    area: null,
  });
  const [chartFilter, setChartFilter] = useState<{ key: string; value: string } | null>(null);

  const columnKeys = useMemo(() => 
    transformedData.length > 0 ? Object.keys(transformedData[0]) : [], 
    [transformedData]
  );

  const numericColumns = useMemo(() => 
    columnKeys.filter(key => transformedData.every(row => !isNaN(Number(row[key])))),
    [columnKeys, transformedData]
  );

  useEffect(() => {
    setFilteredData(transformedData);
  }, [transformedData]);

  const processedData = useMemo(() => {
    let result = [...filteredData];

    if (searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row => 
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    if (chartFilter) {
      result = result.filter(row => 
        String(row[chartFilter.key]).toLowerCase() === chartFilter.value.toLowerCase()
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valueA = a[sortConfig.key!];
        const valueB = b[sortConfig.key!];
        
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortConfig.direction === 'asc' 
            ? valueA - valueB 
            : valueB - valueA;
        }
        
        const stringA = String(valueA).toLowerCase();
        const stringB = String(valueB).toLowerCase();
        
        return sortConfig.direction === 'asc'
          ? stringA.localeCompare(stringB)
          : stringB.localeCompare(stringA);
      });
    }

    return result;
  }, [filteredData, searchTerm, sortConfig, advancedFilters, chartFilter]);

  // Compute Correlation Matrix
  const correlationMatrix = useMemo(() => {
    if (numericColumns.length < 2) return null;

    const matrix: Record<string, Record<string, number>> = {};
    numericColumns.forEach(col1 => {
      matrix[col1] = {};
      numericColumns.forEach(col2 => {
        if (col1 === col2) {
          matrix[col1][col2] = 1;
        return;
      }

      const values1 = transformedData.map(row => Number(row[col1])).filter(val => !isNaN(val));
      const values2 = transformedData.map(row => Number(row[col2])).filter(val => !isNaN(val));

      if (values1.length !== values2.length || values1.length === 0) {
        matrix[col1][col2] = 0;
        return;
      }

      const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
      const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

      let numerator = 0;
      let denominator1 = 0;
      let denominator2 = 0;

      for (let i = 0; i < values1.length; i++) {
        const diff1 = values1[i] - mean1;
        const diff2 = values2[i] - mean2;
        numerator += diff1 * diff2;
        denominator1 += diff1 * diff1;
        denominator2 += diff2 * diff2;
      }

      const correlation = denominator1 === 0 || denominator2 === 0 
        ? 0 
        : numerator / Math.sqrt(denominator1 * denominator2);
      matrix[col1][col2] = Number(correlation.toFixed(2));
    });
  });

  return matrix;
}, [numericColumns, transformedData]);

// Outlier Detection
const outliers = useMemo(() => {
  const outlierData: Record<string, { count: number; rows: number[] }> = {};
  const outlierRows: Set<number> = new Set();

  numericColumns.forEach(col => {
    const values = transformedData
      .map((row, index) => ({ value: Number(row[col]), index }))
      .filter(item => !isNaN(item.value));

    if (values.length === 0) {
      outlierData[col] = { count: 0, rows: [] };
      return;
    }

    const sortedValues = values.map(item => item.value).sort((a, b) => a - b);
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const colOutliers = values.filter(item => item.value < lowerBound || item.value > upperBound);
    colOutliers.forEach(item => outlierRows.add(item.index));

    outlierData[col] = {
      count: colOutliers.length,
      rows: colOutliers.map(item => item.index),
    };
  });

  return { outlierData, outlierRows: Array.from(outlierRows) };
}, [numericColumns, transformedData]);

// Trend Analysis for Time-Series Data
const trendAnalysis = useMemo(() => {
  const dateColumn = columnKeys.find(col => 
    col.toLowerCase().includes("date") && 
    transformedData.every(row => !isNaN(Date.parse(row[col])))
  );

  if (!dateColumn || !yKey || !numericColumns.includes(yKey)) {
    return null;
  }

  const timeData = transformedData
    .map((row, index) => ({
      date: new Date(row[dateColumn]).getTime(),
      value: Number(row[yKey]),
      index,
    }))
    .filter(item => !isNaN(item.value) && !isNaN(item.date))
    .sort((a, b) => a.date - b.date);

  if (timeData.length < 2) {
    return null;
  }

  // Linear Regression for Trend
  const n = timeData.length;
  const sumX = timeData.reduce((sum, item) => sum + item.date, 0);
  const sumY = timeData.reduce((sum, item) => sum + item.value, 0);
  const sumXY = timeData.reduce((sum, item) => sum + item.date * item.value, 0);
  const sumXX = timeData.reduce((sum, item) => sum + item.date * item.date, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate trend line data
  const trendData = timeData.map(item => ({
    date: new Date(item.date).toISOString().split('T')[0],
    actual: item.value,
    trend: slope * item.date + intercept,
  }));

  // Forecast for the next 5 periods (assuming daily data for simplicity)
  const lastDate = timeData[timeData.length - 1].date;
  const forecastData = [];
  const timeStep = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  for (let i = 1; i <= 5; i++) {
    const forecastDate = lastDate + i * timeStep;
    const forecastValue = slope * forecastDate + intercept;
    forecastData.push({
      date: new Date(forecastDate).toISOString().split('T')[0],
      forecast: forecastValue,
    });
  }

  return { dateColumn, yKey, trendData, forecastData };
}, [columnKeys, transformedData, yKey]);

const dataStats = useMemo(() => {
  if (transformedData.length === 0) return null;

  const numericColumns = columnKeys.filter(key => 
    transformedData.every(row => !isNaN(Number(row[key])))
  );

  const categoricalColumns = columnKeys.filter(key => 
    transformedData.some(row => isNaN(Number(row[key])))
  );

  return {
    totalRows: transformedData.length,
    columns: columnKeys.length,
    numericColumns: numericColumns.length,
    categoricalColumns: categoricalColumns.length,
    averages: numericColumns.reduce((acc, key) => {
      const values = transformedData
        .map(row => Number(row[key]))
        .filter(val => !isNaN(val));
      const mean = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      const sortedValues = [...values].sort((a, b) => a - b);
      const median = sortedValues.length > 0 
        ? sortedValues.length % 2 === 0 
          ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2 
          : sortedValues[Math.floor(sortedValues.length / 2)]
        : 0;
      acc[key] = {
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        min: values.length > 0 ? Math.min(...values).toFixed(2) : "N/A",
        max: values.length > 0 ? Math.max(...values).toFixed(2) : "N/A"
      };
      return acc;
    }, {} as Record<string, {mean: string, median: string, min: string, max: string}>)
  };
}, [transformedData, columnKeys]);

const chartRecommendations = useMemo(() => {
  if (!xKey || !yKey || !processedData.length) return [];

  const isXNumeric = processedData.every(row => !isNaN(Number(row[xKey])));
  const isYNumeric = processedData.every(row => !isNaN(Number(row[yKey])));

  const recommendations: string[] = [];

  if (!isXNumeric && isYNumeric) {
    recommendations.push("Bar Chart (Compare averages across categories)");
  }

  if (isLineChartSupported(processedData, xKey, yKey)) {
    recommendations.push("Line Chart (Show trends over a continuous x-axis)");
  }

  if (!isXNumeric && isYNumeric) {
    recommendations.push("Pie Chart (Show proportions of a numeric value across categories)");
  }

  if (isScatterChartSupported(processedData, xKey, yKey)) {
    recommendations.push("Scatter Chart (Explore relationships between two variables)");
  }

  if (!isXNumeric && isYNumeric) {
    recommendations.push("Box Plot (Visualize distribution, median, and outliers)");
  }

  if (isAreaChartSupported(processedData, xKey, yKey)) {
    recommendations.push("Area Chart (Show cumulative trends over a continuous x-axis)");
  }

  return recommendations;
}, [xKey, yKey, processedData]);

const handleExport = useCallback(() => {
  const csv = Papa.unparse(processedData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `exported_data_${new Date().toISOString().split('T')[0]}.csv`);
}, [processedData]);

const handleSort = (key: string) => {
  setSortConfig(prev => ({
    key,
    direction: prev.key === key && prev.direction === 'asc' 
      ? 'desc' 
      : 'asc'
  }));
};

const handleReset = () => {
  setTransformedData(data);
  setFilteredData(data);
  setSearchTerm("");
  setSortConfig({ key: null, direction: 'asc' });
  setAdvancedFilters({});
  setZoomDomains({ bar: null, line: null, scatter: null, area: null });
  setChartFilter(null);
};

const handleAddColumn = (newColumnName: string, column1: string, column2: string, operation: "+" | "-" | "*" | "/") => {
  const newData = transformedData.map(row => {
    const val1 = Number(row[column1]);
    const val2 = Number(row[column2]);
    let result: number;

    if (isNaN(val1) || isNaN(val2)) {
      result = 0;
    } else {
      switch (operation) {
        case "+":
          result = val1 + val2;
          break;
        case "-":
          result = val1 - val2;
          break;
        case "*":
          result = val1 * val2;
          break;
        case "/":
          result = val2 !== 0 ? val1 / val2 : 0;
          break;
        default:
          result = 0;
      }
    }

    return {
      ...row,
      [newColumnName]: result
    };
  });

  setTransformedData(newData);
};

const handleCleanData = (cleanColumn: string, fillMethod: "mean" | "median" | "custom", customFillValue: string) => {
  const values = transformedData
    .map(row => Number(row[cleanColumn]))
    .filter(val => !isNaN(val) && val !== null && val !== undefined);

  let fillValue: number;
  if (fillMethod === "mean") {
    fillValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  } else if (fillMethod === "median") {
    const sortedValues = [...values].sort((a, b) => a - b);
    fillValue = sortedValues.length > 0 
      ? sortedValues.length % 2 === 0 
        ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2 
        : sortedValues[Math.floor(sortedValues.length / 2)]
      : 0;
  } else {
    fillValue = Number(customFillValue) || 0;
  }

  const newData = transformedData.map(row => {
    if (row[cleanColumn] === null || row[cleanColumn] === undefined || row[cleanColumn] === "" || isNaN(Number(row[cleanColumn]))) {
      return {
        ...row,
        [cleanColumn]: fillValue
      };
    }
    return row;
  });

  setTransformedData(newData);
};

const handleDataChange = (newData: DataRow[]) => {
  setTransformedData(newData);
};

const renderAdvancedFilterDialog = () => (
  <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogDescription>
          Apply filters to specific columns
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {columnKeys.map(col => (
          <div key={col} className="flex items-center space-x-2">
            <Input
              placeholder={`Filter by ${col}`}
              value={advancedFilters[col] || ''}
              onChange={(e) => setAdvancedFilters(prev => ({
                ...prev,
                [col]: e.target.value
              }))}
            />
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

const renderHelpDialog = () => (
  <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Chart Types Help</DialogTitle>
        <DialogDescription>
          Learn about the different chart types and when to use them.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Bar Chart</h3>
          <p>Best for comparing averages or counts across categories. Use with a categorical x-axis (e.g., Sex) and a numeric y-axis (e.g., Age).</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Line Chart</h3>
          <p>Ideal for showing trends over a continuous x-axis. Requires a numeric x-axis with more than 2 unique values (e.g., Year) and a numeric y-axis (e.g., Sales).</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Pie Chart</h3>
          <p>Useful for showing proportions of a numeric value across categories. Use with a categorical x-axis (e.g., Sex) and a numeric y-axis (e.g., Fare).</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Scatter Chart</h3>
          <p>Great for exploring relationships between two variables. Requires at least one numeric axis (e.g., Age vs. Fare).</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Box Plot</h3>
          <p>Shows the distribution, median, quartiles, and outliers of a numeric variable across categories. Use with a categorical x-axis (e.g., Sex) and a numeric y-axis (e.g., Age).</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Area Chart</h3>
          <p>Visualizes cumulative trends over a continuous x-axis. Requires both x-axis and y-axis to be numeric (e.g., Pclass vs. cumulative Fare).</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const renderChartRecommendations = () => {
  if (!chartRecommendations.length) {
    return <p className="text-center text-gray-500">Select xKey and yKey to see chart recommendations.</p>;
  }

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-semibold mb-2">Recommended Charts:</h3>
      <ul className="list-disc list-inside">
        {chartRecommendations.map((rec, index) => (
          <li key={index} className="text-gray-700">{rec}</li>
        ))}
      </ul>
    </div>
  );
};

const renderDataInsights = () => {
  if (!dataStats) {
    return <p className="text-center text-gray-500">No data available to display insights.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Basic Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Rows</CardTitle>
          </CardHeader>
          <CardContent>{dataStats.totalRows}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Columns</CardTitle>
          </CardHeader>
          <CardContent>{dataStats.columns}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Numeric Columns</CardTitle>
          </CardHeader>
          <CardContent>{dataStats.numericColumns}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categorical Columns</CardTitle>
          </CardHeader>
          <CardContent>{dataStats.categoricalColumns}</CardContent>
        </Card>
      </div>

      {/* Numeric Column Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Numeric Column Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Mean</TableHead>
                  <TableHead>Median</TableHead>
                  <TableHead>Min</TableHead>
                  <TableHead>Max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(dataStats.averages).map(([col, stats]) => (
                  <TableRow key={col}>
                    <TableCell>{col}</TableCell>
                    <TableCell>{stats.mean}</TableCell>
                    <TableCell>{stats.median}</TableCell>
                    <TableCell>{stats.min}</TableCell>
                    <TableCell>{stats.max}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Matrix */}
      {correlationMatrix && (
        <Card>
          <CardHeader>
            <CardTitle>Correlation Matrix (Pearson)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    {numericColumns.map(col => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {numericColumns.map(col1 => (
                    <TableRow key={col1}>
                      <TableCell>{col1}</TableCell>
                      {numericColumns.map(col2 => {
                        const correlation = correlationMatrix[col1][col2];
                        const color = correlation > 0.5 ? "bg-green-200" : 
                                     correlation < -0.5 ? "bg-red-200" : 
                                     "bg-gray-100";
                        return (
                          <TableCell key={col2} className={`${color} text-center`}>
                            {correlation}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outlier Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Outlier Detection (IQR Method)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Outlier Count</TableHead>
                  <TableHead>Outlier Rows</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(outliers.outlierData).map(([col, { count, rows }]) => (
                  <TableRow key={col}>
                    <TableCell>{col}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell>
                      {rows.length > 0 ? rows.slice(0, 5).join(", ") + (rows.length > 5 ? "..." : "") : "None"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Total rows with outliers: {outliers.outlierRows.length}
          </p>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      {trendAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis ({trendAnalysis.dateColumn} vs {trendAnalysis.yKey})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[...trendAnalysis.trendData, ...trendAnalysis.forecastData]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" />
                <Line type="monotone" dataKey="trend" stroke="#82ca9d" name="Trend" />
                <Line type="monotone" dataKey="forecast" stroke="#ff7300" name="Forecast" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const renderCharts = () => {
  if (!xKey || !yKey) return null;

  const chartTypes = [
    { type: "bar", component: BarChartComponent },
    ...(isLineChartSupported(processedData, xKey, yKey) 
      ? [{ type: "line", component: LineChartComponent }] 
      : []),
    ...(isPieChartSupported(processedData, yKey) 
      ? [{ type: "pie", component: PieChartComponent }] 
      : []),
    ...(isScatterChartSupported(processedData, xKey, yKey) 
      ? [{ type: "scatter", component: ScatterChartComponent }] 
      : []),
    ...(isBoxPlotSupported(processedData, xKey, yKey) 
      ? [{ type: "box", component: BoxPlotComponent }] 
      : []),
    ...(isAreaChartSupported(processedData, xKey, yKey) 
      ? [{ type: "area", component: AreaChartComponent }] 
      : []),
  ];

  if (!chartTypes.length) {
    return <p className="text-center text-red-500">No charts are supported for the selected xKey and yKey. Check recommendations for guidance.</p>;
  }

  const gridCols = chartTypes.length === 1 ? "grid-cols-1" : 
                  chartTypes.length === 2 ? "grid-cols-2" : 
                  chartTypes.length === 3 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {chartTypes.map(({ type, component: ChartComponent }) => (
        <Card key={type} className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{type.charAt(0).toUpperCase() + type.slice(1)} Chart</CardTitle>
            {type !== "pie" && type !== "box" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomDomains(prev => ({ ...prev, [type]: null }))}
              >
                <ZoomIn className="mr-2" size={16} /> Reset Zoom
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ChartComponent 
              data={processedData} 
              originalData={filteredData}
              xKey={xKey} 
              yKey={yKey} 
              zoomDomain={zoomDomains[type] || undefined}
              onZoomChange={(domain: { start: number; end: number }) => 
                setZoomDomains(prev => ({ ...prev, [type]: domain }))
              }
              onDataPointClick={(key: string, value: string) => 
                setChartFilter({ key: xKey, value })
              }
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

return (
  <div className="p-6 space-y-6">
    <div className="flex gap-4 items-center">
      <div className="flex items-center relative flex-grow">
        <Input
          placeholder="Global search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
        <Filter className="absolute right-3 text-gray-400" size={20} />
      </div>

      <Button 
        variant="outline" 
        onClick={() => setIsFilterDialogOpen(true)}
      >
        <FilterIcon className="mr-2" size={16} /> Advanced Filters
      </Button>

      <Button 
        variant="outline" 
        onClick={() => setIsAddColumnDialogOpen(true)}
      >
        <Plus className="mr-2" size={16} /> Add Column
      </Button>

      <Button 
        variant="outline" 
        onClick={() => setIsCleanDataDialogOpen(true)}
      >
        <Wrench className="mr-2" size={16} /> Clean Data
      </Button>

      <Select onValueChange={setXKey}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="X-Axis Column" />
        </SelectTrigger>
        <SelectContent>
          {columnKeys.map((col) => (
            <SelectItem key={col} value={col}>{col}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={setYKey}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Y-Axis Column" />
        </SelectTrigger>
        <SelectContent>
          {columnKeys.map((col) => (
            <SelectItem key={col} value={col}>{col}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        variant="outline" 
        onClick={() => setIsHelpDialogOpen(true)}
      >
        <HelpCircle className="mr-2" size={16} /> Help
      </Button>

      <div className="flex gap-2">
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2" size={16} /> Export
        </Button>
        <Button onClick={handleReset} variant="secondary">
          <RefreshCw className="mr-2" size={16} /> Reset
        </Button>
      </div>
    </div>

    {/* Chart Recommendations and Charts at the Top */}
    {renderChartRecommendations()}
    {renderCharts()}

    {/* Data Insights and Data Table Below */}
    {renderDataInsights()}

    <DataTable
      data={processedData}
      columnKeys={columnKeys}
      sortConfig={sortConfig}
      onSort={handleSort}
      onDataChange={handleDataChange}
      outlierRows={outliers.outlierRows}
    />

    {renderAdvancedFilterDialog()}
    {renderHelpDialog()}
    <AddColumnDialog
      isOpen={isAddColumnDialogOpen}
      onOpenChange={setIsAddColumnDialogOpen}
      numericColumns={numericColumns}
      onAddColumn={handleAddColumn}
    />
    <CleanDataDialog
      isOpen={isCleanDataDialogOpen}
      onOpenChange={setIsCleanDataDialogOpen}
      numericColumns={numericColumns}
      onCleanData={handleCleanData}
    />
  </div>
);
};

export default Dashboard;