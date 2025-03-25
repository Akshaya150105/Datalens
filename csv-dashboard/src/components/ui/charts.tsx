import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend, ScatterChart, Scatter, CartesianGrid, Brush, AreaChart, Area } from "recharts";

// Define a more specific type for the data rows
type DataRow = Record<string, string | number>;

interface ChartProps {
  data: DataRow[];
  originalData: DataRow[];
  xKey: string;
  yKey: string;
  zoomDomain?: { start: number; end: number };
  onZoomChange?: (domain: { start: number; end: number }) => void;
  onDataPointClick?: (key: string, value: string) => void;
}

const ChartErrorBoundary = ({ children, errorMessage }: { children: React.ReactNode; errorMessage: string }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    return <p className="text-center text-red-500">{errorMessage}</p>;
  }
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, originalData, xKey, yKey }: {
  active?: boolean;
  payload?: any[];
  label?: string;
  originalData: DataRow[];
  xKey: string;
  yKey: string;
}) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const matchingRows = originalData.filter((row: DataRow) => String(row[xKey]) === String(dataPoint.name || label));
    return (
      <div className="bg-white p-4 border rounded shadow">
        <p className="font-bold">{`${xKey}: ${dataPoint.name || label}`}</p>
        <p>{`${yKey}: ${dataPoint[yKey] || payload[0].value}`}</p>
        {matchingRows.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">Details:</p>
            {matchingRows.slice(0, 3).map((row: DataRow, index: number) => (
              <div key={index} className="text-sm">
                {row.Name && <p>Name: {row.Name}</p>}
                {row.Ticket && <p>Ticket: {row.Ticket}</p>}
              </div>
            ))}
            {matchingRows.length > 3 && <p className="text-gray-500">...and {matchingRows.length - 3} more</p>}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Scatter Chart
const ScatterTooltip = ({ active, payload, originalData, xKey, yKey }: {
  active?: boolean;
  payload?: any[];
  originalData: DataRow[];
  xKey: string;
  yKey: string;
}) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const matchingRow = originalData.find((row: DataRow) => 
      String(row[xKey]) === String(dataPoint[xKey]) && 
      String(row[yKey]) === String(dataPoint[yKey])
    );
    return (
      <div className="bg-white p-4 border rounded shadow">
        <p className="font-bold">{`${xKey}: ${dataPoint[xKey]}`}</p>
        <p>{`${yKey}: ${dataPoint[yKey]}`}</p>
        {matchingRow && (
          <div className="mt-2">
            <p className="font-semibold">Details:</p>
            {matchingRow.Name && <p>Name: {matchingRow.Name}</p>}
            {matchingRow.Ticket && <p>Ticket: {matchingRow.Ticket}</p>}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Helper function to calculate box plot statistics
const calculateBoxPlotStats = (data: DataRow[], xKey: string, yKey: string) => {
  const groupedData = data.reduce((acc: Record<string, number[]>, row: DataRow) => {
    const xValue = String(row[xKey]);
    const yValue = Number(row[yKey]);
    if (!isNaN(yValue)) {
      if (!acc[xValue]) {
        acc[xValue] = [];
      }
      acc[xValue].push(yValue);
    }
    return acc;
  }, {});

  return Object.entries(groupedData).map(([name, values]) => {
    const sortedValues = values.sort((a, b) => a - b);
    const count = sortedValues.length;
    const q1 = sortedValues[Math.floor(count * 0.25)];
    const median = sortedValues[Math.floor(count * 0.5)];
    const q3 = sortedValues[Math.floor(count * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = sortedValues.filter(val => val < lowerBound || val > upperBound);
    const nonOutliers = sortedValues.filter(val => val >= lowerBound && val <= upperBound);
    const min = nonOutliers[0] || 0;
    const max = nonOutliers[nonOutliers.length - 1] || 0;

    return {
      name,
      min,
      q1,
      median,
      q3,
      max,
      outliers,
    };
  });
};

const isNumericColumn = (data: DataRow[], key: string) => {
  return data.length > 0 && data.every(item => !isNaN(Number(item[key])));
};

const isLineChartSupported = (data: DataRow[], xKey: string, yKey: string) => {
  const uniqueXValues = new Set(data.map(item => item[xKey])).size;
  return isNumericColumn(data, yKey) && isNumericColumn(data, xKey) && uniqueXValues > 2;
};

const isPieChartSupported = (data: DataRow[], yKey: string) => {
  return isNumericColumn(data, yKey);
};

const isScatterChartSupported = (data: DataRow[], xKey: string, yKey: string) => {
  return data.length > 0 && (isNumericColumn(data, xKey) || isNumericColumn(data, yKey));
};

const isBoxPlotSupported = (data: DataRow[], xKey: string, yKey: string) => {
  return data.length > 0 && isNumericColumn(data, yKey);
};

const isAreaChartSupported = (data: DataRow[], xKey: string, yKey: string) => {
  return data.length > 0 && isNumericColumn(data, yKey) && isNumericColumn(data, xKey);
};

export const BarChartComponent = ({ data, originalData, xKey, yKey, zoomDomain, onZoomChange, onDataPointClick }: ChartProps) => {
  if (!data?.length || !xKey || !yKey) {
    return <p className="text-center text-red-500">Bar Chart requires data, xKey, and yKey to be defined.</p>;
  }

  const isYNumeric = isNumericColumn(data, yKey);

  let chartData: Array<Record<string, any>>;
  if (isYNumeric) {
    const aggregatedData = data.reduce((acc: Record<string, { sum: number; count: number }>, curr) => {
      const xValue = String(curr[xKey]);
      const yValue = Number(curr[yKey]);

      if (!acc[xValue]) {
        acc[xValue] = { sum: 0, count: 0 };
      }
      acc[xValue].sum += yValue;
      acc[xValue].count += 1;
      return acc;
    }, {});

    chartData = Object.entries(aggregatedData).map(([xValue, { sum, count }], index) => ({
      name: xValue,
      [yKey]: sum / count,
      index
    }));
  } else {
    const aggregatedData = data.reduce((acc: Record<string, Record<string, number>>, curr) => {
      const xValue = String(curr[xKey]);
      const yValue = String(curr[yKey]);

      if (!acc[xValue]) {
        acc[xValue] = {};
      }
      acc[xValue][yValue] = (acc[xValue][yValue] || 0) + 1;
      return acc;
    }, {});

    chartData = Object.entries(aggregatedData).map(([xValue, yValues], index) => ({
      name: xValue,
      ...yValues,
      index
    }));
  }

  if (!chartData.length) {
    return <p className="text-center text-red-500">Bar Chart cannot render: No valid data after aggregation.</p>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <ChartErrorBoundary errorMessage="Error rendering bar chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis type={isYNumeric ? "number" : "number"} />
          <Tooltip content={<CustomTooltip originalData={originalData} xKey={xKey} yKey={yKey} />} />
          <Legend />
          {isYNumeric ? (
            <Bar 
              dataKey={yKey} 
              fill={COLORS[0]} 
              onClick={(data) => onDataPointClick?.(xKey, data.name)}
            />
          ) : (
            Object.keys(chartData[0]).filter(key => key !== "name" && key !== "index").map((yValue, index) => (
              <Bar 
                key={yValue} 
                dataKey={yValue} 
                stackId="a" 
                fill={COLORS[index % COLORS.length]} 
                onClick={(data) => onDataPointClick?.(xKey, data.name)}
              />
            ))
          )}
          <Brush
            dataKey="index"
            height={30}
            stroke="#8884d8"
            onChange={(e: any) => {
              if (e.startIndex !== undefined && e.endIndex !== undefined) {
                onZoomChange?.({ start: e.startIndex, end: e.endIndex });
              }
            }}
            startIndex={zoomDomain?.start}
            endIndex={zoomDomain?.end}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
};

export const LineChartComponent = ({ data, originalData, xKey, yKey, zoomDomain, onZoomChange, onDataPointClick }: ChartProps) => {
  if (!data?.length || !xKey || !yKey) {
    return <p className="text-center text-red-500">Line Chart requires data, xKey, and yKey to be defined.</p>;
  }

  if (!isLineChartSupported(data, xKey, yKey)) {
    return (
      <p className="text-center text-red-500">
        Line Chart requires a continuous (numeric) x-axis with more than 2 unique values and a numeric y-axis.
      </p>
    );
  }

  const chartData = data.map((item: DataRow, index: number) => ({
    ...item,
    [yKey]: Number(item[yKey]),
    index
  }));

  return (
    <ChartErrorBoundary errorMessage="Error rendering line chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey={xKey} />
          <YAxis type="number" />
          <Tooltip content={<CustomTooltip originalData={originalData} xKey={xKey} yKey={yKey} />} />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            stroke="#82ca9d" 
            connectNulls={true} 
            onClick={(data: DataRow) => onDataPointClick?.(xKey, String(data[xKey]))}
          />
          <Brush
            dataKey="index"
            height={30}
            stroke="#8884d8"
            onChange={(e: any) => {
              if (e.startIndex !== undefined && e.endIndex !== undefined) {
                onZoomChange?.({ start: e.startIndex, end: e.endIndex });
              }
            }}
            startIndex={zoomDomain?.start}
            endIndex={zoomDomain?.end}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
};

export const PieChartComponent = ({ data, originalData, xKey, yKey, onDataPointClick }: ChartProps) => {
  if (!data?.length || !xKey || !yKey) {
    return <p className="text-center text-red-500">Pie Chart requires data, xKey, and yKey to be defined.</p>;
  }

  if (!isPieChartSupported(data, yKey)) {
    return <p className="text-center text-red-500">Pie Chart requires a numeric y-axis.</p>;
  }

  interface PieData {
    name: string;
    value: number;
  }

  const pieData = data.reduce((acc: PieData[], curr: DataRow) => {
    const name = String(curr[xKey]);
    const value = Number(curr[yKey]);

    if (!isNaN(value) && name) {
      const existing = acc.find(item => item.name === name);
      if (existing) {
        existing.value += value;
      } else {
        acc.push({ name, value });
      }
    }
    return acc;
  }, []);

  if (!pieData.length) {
    return <p className="text-center text-red-500">Pie Chart cannot render: No valid data after aggregation.</p>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <ChartErrorBoundary errorMessage="Error rendering pie chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
            onClick={(data) => onDataPointClick?.(xKey, data.name)}
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip originalData={originalData} xKey={xKey} yKey={yKey} />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
};

export const ScatterChartComponent = ({ data, originalData, xKey, yKey, zoomDomain, onZoomChange, onDataPointClick }: ChartProps) => {
  if (!originalData?.length || !xKey || !yKey) {
    return <p className="text-center text-red-500">Scatter Chart requires data, xKey, and yKey to be defined.</p>;
  }

  if (!isScatterChartSupported(originalData, xKey, yKey)) {
    return <p className="text-center text-red-500">Scatter Chart requires at least one numeric axis (x or y).</p>;
  }

  const isXNumeric = isNumericColumn(originalData, xKey);
  const isYNumeric = isNumericColumn(originalData, yKey);

  const chartData = originalData.map((item: DataRow, index: number) => ({
    ...item,
    [xKey]: isXNumeric ? Number(item[xKey]) : item[xKey],
    [yKey]: isYNumeric ? Number(item[yKey]) : item[yKey],
    index
  }));

  return (
    <ChartErrorBoundary errorMessage="Error rendering scatter chart">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} type={isXNumeric ? "number" : "category"} />
          <YAxis dataKey={yKey} type={isYNumeric ? "number" : "category"} />
          <Tooltip content={<ScatterTooltip originalData={originalData} xKey={xKey} yKey={yKey} />} />
          <Legend />
          <Scatter 
            name="Data Points" 
            data={chartData} 
            fill="#8884d8" 
            onClick={(data: DataRow) => onDataPointClick?.(xKey, String(data[xKey]))}
          />
          <Brush
            dataKey="index"
            height={30}
            stroke="#8884d8"
            onChange={(e: any) => {
              if (e.startIndex !== undefined && e.endIndex !== undefined) {
                onZoomChange?.({ start: e.startIndex, end: e.endIndex });
              }
            }}
            startIndex={zoomDomain?.start}
            endIndex={zoomDomain?.end}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
};

export const BoxPlotComponent = ({ data, originalData, xKey, yKey }: ChartProps) => {
  if (!data?.length || !xKey || !yKey) {
    return <p className="text-center text-red-500">Box Plot requires data, xKey, and yKey to be defined.</p>;
  }

  if (!isBoxPlotSupported(data,xKey,yKey)) {
    return <p className="text-center text-red-500">Box Plot requires a numeric y-axis.</p>;
  }

  const boxPlotData = calculateBoxPlotStats(data, xKey, yKey);

  if (!boxPlotData.length) {
    return <p className="text-center text-red-500">Box Plot cannot render: No valid data after processing.</p>;
  }

  return (
    <ChartErrorBoundary errorMessage="Error rendering box plot">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" type="category" />
          <YAxis dataKey={yKey} type="number" />
          <Tooltip content={<CustomTooltip originalData={originalData} xKey={xKey} yKey={yKey} />} />
          {boxPlotData.map((entry, index) => (
            <g key={index}>
              <rect
                x={index * 50 + 20}
                y={entry.q3}
                width={30}
                height={entry.q1 - entry.q3}
                fill="#8884d8"
                opacity={0.5}
              />
              <line
                x1={index * 50 + 20}
                y1={entry.median}
                x2={index * 50 + 50}
                y2={entry.median}
                stroke="#000"
                strokeWidth={2}
              />
              <line
                x1={index * 50 + 35}
                y1={entry.min}
                x2={index * 50 + 35}
                y2={entry.q1}
                stroke="#000"
                strokeWidth={1}
              />
              <line
                x1={index * 50 + 35}
                y1={entry.q3}
                x2={index * 50 + 35}
                y2={entry.max}
                stroke="#000"
                strokeWidth={1}
              />
              <line
                x1={index * 50 + 25}
                y1={entry.min}
                x2={index * 50 + 45}
                y2={entry.min}
                stroke="#000"
                strokeWidth={1}
              />
              <line
                x1={index * 50 + 25}
                y1={entry.max}
                x2={index * 50 + 45}
                y2={entry.max}
                stroke="#000"
                strokeWidth={1}
              />
              {entry.outliers.map((outlier, i) => (
                <circle
                  key={i}
                  cx={index * 50 + 35}
                  cy={outlier}
                  r={3}
                  fill="#FF8042"
                />
              ))}
            </g>
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
};

export const AreaChartComponent = ({ data, originalData, xKey, yKey, zoomDomain, onZoomChange }: ChartProps) => {
  if (!data?.length || !xKey || !yKey) {
    return <p className="text-center text-red-500">Area Chart requires data, xKey, and yKey to be defined.</p>;
  }

  if (!isAreaChartSupported(data, xKey, yKey)) {
    return <p className="text-center text-red-500">Area Chart requires both x-axis and y-axis to be numeric.</p>;
  }

  const sortedData = [...data].sort((a, b) => Number(a[xKey]) - Number(b[xKey]));
  let cumulative = 0;
  const chartData = sortedData.map((item: DataRow, index: number) => {
    const yValue = Number(item[yKey]);
    cumulative += isNaN(yValue) ? 0 : yValue;
    return {
      ...item,
      [xKey]: Number(item[xKey]),
      cumulative: cumulative,
      index
    };
  });

  return (
    <ChartErrorBoundary errorMessage="Error rendering area chart">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} type="number" />
          <YAxis type="number" />
          <Tooltip content={<CustomTooltip originalData={originalData} xKey={xKey} yKey="cumulative" />} />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.3}
          />
          <Brush
            dataKey="index"
            height={30}
            stroke="#8884d8"
            onChange={(e: any) => {
              if (e.startIndex !== undefined && e.endIndex !== undefined) {
                onZoomChange?.({ start: e.startIndex, end: e.endIndex });
              }
            }}
            startIndex={zoomDomain?.start}
            endIndex={zoomDomain?.end}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
};

export { isLineChartSupported, isPieChartSupported, isScatterChartSupported, isBoxPlotSupported, isAreaChartSupported };