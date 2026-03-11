import { useState, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, PolarArea, Radar } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, FileSpreadsheet, BarChart3, Activity, TrendingUp, Download } from 'lucide-react';
import { Badge } from '../ui/badge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  RadialLinearScale,
  Filler,
  LineElement
);

const CustomDatasetAnalytics = () => {
  const [dataset, setDataset] = useState(null);
  const [fileName, setFileName] = useState('');
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setFileName(file.name);

    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'csv') {
      // Parse CSV
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0];
            const data = results.data.slice(1).filter(row => row.some(cell => cell !== ''));
            
            const parsedData = data.map(row => {
              const obj = {};
              headers.forEach((header, idx) => {
                obj[header] = row[idx];
              });
              return obj;
            });
            
            setDataset(parsedData);
            setColumns(headers);
          }
          setLoading(false);
        },
        error: () => {
          setError('Failed to parse CSV file');
          setLoading(false);
        }
      });
    } else if (['xlsx', 'xls'].includes(fileType)) {
      // Parse Excel
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          if (data.length > 0) {
            setDataset(data);
            setColumns(Object.keys(data[0]));
          }
          setLoading(false);
        } catch (err) {
          setError('Failed to parse Excel file');
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError('Please upload a CSV or Excel file');
      setLoading(false);
    }
  };

  // Chart options configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 18,
          font: { 
            size: 13,
            family: "'Inter', sans-serif",
            weight: '500',
          },
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 16,
        titleFont: { size: 15, weight: 'bold' },
        bodyFont: { size: 14 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Format number with commas
              label += new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          lineWidth: 1,
        },
        ticks: {
          font: { size: 12, weight: '500' },
          color: '#6b7280',
          padding: 8,
          callback: function(value) {
            // Format Y-axis numbers with commas
            return new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  // Custom options for Total Amount chart with rupee formatting
  const amountChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Format with rupee symbol
              label += '₹' + new Intl.NumberFormat('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: function(value) {
            if (value >= 1000) {
              return '₹' + (value / 1000).toFixed(0) + 'K';
            }
            return '₹' + value;
          }
        },
      },
    },
  };

  // Generate charts based on data
  const generateCharts = useMemo(() => {
    if (!dataset || dataset.length === 0) return [];

    // Helper function to map color names to actual colors
    const getColorFromName = (colorName) => {
      const name = colorName?.toLowerCase().trim() || '';
      const colorMap = {
        'red': 'rgba(239, 68, 68, 0.9)',
        'blue': 'rgba(59, 130, 246, 0.9)',
        'green': 'rgba(34, 197, 94, 0.9)',
        'yellow': 'rgba(251, 191, 36, 0.9)',
        'orange': 'rgba(249, 115, 22, 0.9)',
        'purple': 'rgba(168, 85, 247, 0.9)',
        'pink': 'rgba(236, 72, 153, 0.9)',
        'black': 'rgba(17, 24, 39, 0.9)',
        'white': 'rgba(226, 232, 240, 0.9)',
        'gray': 'rgba(107, 114, 128, 0.9)',
        'grey': 'rgba(107, 114, 128, 0.9)',
        'brown': 'rgba(120, 53, 15, 0.9)',
        'beige': 'rgba(245, 222, 179, 0.9)',
        'teal': 'rgba(20, 184, 166, 0.9)',
        'cyan': 'rgba(6, 182, 212, 0.9)',
        'indigo': 'rgba(99, 102, 241, 0.9)',
        'violet': 'rgba(139, 92, 246, 0.9)',
        'amber': 'rgba(245, 158, 11, 0.9)',
        'lime': 'rgba(132, 204, 22, 0.9)',
        'emerald': 'rgba(16, 185, 129, 0.9)',
        'sky': 'rgba(14, 165, 233, 0.9)',
        'rose': 'rgba(244, 63, 94, 0.9)',
        'fuchsia': 'rgba(217, 70, 239, 0.9)',
        'maroon': 'rgba(127, 29, 29, 0.9)',
        'navy': 'rgba(30, 58, 138, 0.9)',
        'olive': 'rgba(132, 204, 22, 0.9)',
        'silver': 'rgba(203, 213, 225, 0.9)',
        'gold': 'rgba(234, 179, 8, 0.9)',
      };
      
      return colorMap[name] || `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`;
    };

    // Helper function to extract year from date string
    const extractYear = (dateValue) => {
      if (!dateValue) return null;
      
      let year;
      if (dateValue.includes('-')) {
        year = dateValue.split('-')[0];
      } else if (dateValue.includes('/')) {
        const parts = dateValue.split('/');
        year = parts.length === 3 ? parts[2] : parts[0];
      } else if (dateValue.length === 4 && !isNaN(dateValue)) {
        year = dateValue;
      } else {
        // Try to extract 4-digit year
        const match = dateValue.match(/\d{4}/);
        year = match ? match[0] : null;
      }
      return year;
    };

    // Helper function to check if column contains dates
    const isDateColumn = (col) => {
      const colLower = col.toLowerCase();
      if (colLower.includes('date') || colLower.includes('year') || colLower.includes('time')) {
        return true;
      }
      
      // Check if values look like dates
      const sampleValues = dataset.slice(0, 10).map(row => row[col]).filter(v => v);
      const datePattern = /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\d{4}/;
      return sampleValues.length > 0 && sampleValues.every(val => datePattern.test(val));
    };

    const charts = [];
    const numericColumns = [];
    const categoricalColumns = [];
    const dateColumns = [];

    // Identify column types
    columns.forEach(col => {
      const sampleValues = dataset.slice(0, 10).map(row => row[col]);
      // Check if at least 80% of sample values are numeric
      const numericCount = sampleValues.filter(val => !isNaN(parseFloat(val)) && val !== '' && val !== null).length;
      const isNumeric = numericCount >= sampleValues.length * 0.8;
      
      if (isDateColumn(col)) {
        dateColumns.push(col);
        // Don't add to categoricalColumns - we'll handle dates separately
      } else if (isNumeric) {
        numericColumns.push(col);
      } else {
        categoricalColumns.push(col);
      }
    });

    // Chart 1: Color distribution (pie chart)
    const colorColumn = categoricalColumns.find(c => 
      c.toLowerCase().includes('color') || 
      c.toLowerCase().includes('colour')
    );
    
    if (colorColumn) {
      const distribution = {};
      dataset.forEach(row => {
        const value = row[colorColumn] || 'Unknown';
        distribution[value] = (distribution[value] || 0) + 1;
      });

      const sortedEntries = Object.entries(distribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      charts.push({
        type: 'pie',
        title: 'No. of Colors Sold',
        data: {
          labels: sortedEntries.map(([key]) => key),
          datasets: [{
            label: 'Count',
            data: sortedEntries.map(([, value]) => value),
            backgroundColor: sortedEntries.map(([key]) => getColorFromName(key)),
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 15,
          }],
        },
      });
    }

    // Chart 2: Numeric column statistics (bar chart)
    if (numericColumns.length > 0) {
      const col = numericColumns[0];
      const labelCol = columns[0];
      
      // Check if label column is a date - if so, aggregate by year
      if (isDateColumn(labelCol)) {
        const yearlyData = {};
        dataset.forEach(row => {
          const dateValue = row[labelCol];
          const numValue = parseFloat(row[col]);
          
          if (dateValue && !isNaN(numValue)) {
            const year = extractYear(dateValue);
            if (year) {
              if (!yearlyData[year]) {
                yearlyData[year] = [];
              }
              yearlyData[year].push(numValue);
            }
          }
        });
        
        const yearlyTotals = Object.entries(yearlyData)
          .map(([year, values]) => ({
            year,
            total: values.reduce((sum, val) => sum + val, 0)
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);
        
        if (yearlyTotals.length > 0) {
          charts.push({
            type: 'bar',
            title: `Top Performers - Year`,
            data: {
              labels: yearlyTotals.map(item => item.year),
              datasets: [{
                label: col,
                data: yearlyTotals.map(item => item.total),
                backgroundColor: yearlyTotals.map((_, idx) => {
                  const colors = [
                    'rgba(99, 102, 241, 0.85)',
                    'rgba(139, 92, 246, 0.85)',
                    'rgba(168, 85, 247, 0.85)',
                    'rgba(192, 132, 252, 0.85)',
                    'rgba(217, 70, 239, 0.85)',
                    'rgba(236, 72, 153, 0.85)',
                    'rgba(244, 114, 182, 0.85)',
                    'rgba(251, 146, 60, 0.85)',
                    'rgba(251, 191, 36, 0.85)',
                    'rgba(34, 197, 94, 0.85)',
                  ];
                  return colors[idx % colors.length];
                }),
                borderColor: yearlyTotals.map((_, idx) => {
                  const colors = [
                    'rgba(99, 102, 241, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(192, 132, 252, 1)',
                    'rgba(217, 70, 239, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(244, 114, 182, 1)',
                    'rgba(251, 146, 60, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(34, 197, 94, 1)',
                  ];
                  return colors[idx % colors.length];
                }),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
              }],
            },
          });
        }
      } else {
        // Original logic for non-date labels
        const values = dataset
          .map(row => parseFloat(row[col]))
          .filter(val => !isNaN(val))
          .sort((a, b) => b - a)
          .slice(0, 10);

        const labels = dataset
          .map((row, idx) => ({ val: parseFloat(row[col]), idx }))
          .filter(item => !isNaN(item.val))
          .sort((a, b) => b.val - a.val)
          .slice(0, 10)
          .map(item => {
            return dataset[item.idx][labelCol] || `Item ${item.idx + 1}`;
          });

        charts.push({
          type: 'bar',
          title: `Top Performers - ${col}`,
          data: {
            labels: labels.map(l => l.length > 20 ? l.substring(0, 20) + '...' : l),
            datasets: [{
              label: col,
              data: values,
              backgroundColor: values.map((_, idx) => {
                const colors = [
                  'rgba(99, 102, 241, 0.85)',
                  'rgba(139, 92, 246, 0.85)',
                  'rgba(168, 85, 247, 0.85)',
                  'rgba(192, 132, 252, 0.85)',
                  'rgba(217, 70, 239, 0.85)',
                  'rgba(236, 72, 153, 0.85)',
                  'rgba(244, 114, 182, 0.85)',
                  'rgba(251, 146, 60, 0.85)',
                  'rgba(251, 191, 36, 0.85)',
                  'rgba(34, 197, 94, 0.85)',
                ];
                return colors[idx % colors.length];
              }),
              borderColor: values.map((_, idx) => {
                const colors = [
                  'rgba(99, 102, 241, 1)',
                  'rgba(139, 92, 246, 1)',
                  'rgba(168, 85, 247, 1)',
                  'rgba(192, 132, 252, 1)',
                  'rgba(217, 70, 239, 1)',
                  'rgba(236, 72, 153, 1)',
                  'rgba(244, 114, 182, 1)',
                  'rgba(251, 146, 60, 1)',
                  'rgba(251, 191, 36, 1)',
                  'rgba(34, 197, 94, 1)',
                ];
                return colors[idx % colors.length];
              }),
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            }],
          },
        });
      }
    }

    // Chart 3: Material Type Distribution (doughnut chart)
    const materialColumn = columns.find(c => 
      (c.toLowerCase().includes('material') && c.toLowerCase().includes('type')) ||
      c.toLowerCase() === 'material type' ||
      c.toLowerCase() === 'material'
    );
    
    if (materialColumn) {
      const aggregated = {};
      
      // Count occurrences of each material type
      dataset.forEach(row => {
        const category = row[materialColumn] || 'Unknown';
        if (!aggregated[category]) {
          aggregated[category] = 0;
        }
        aggregated[category] += 1;
      });

      const sortedCategories = Object.entries(aggregated)
        .map(([cat, count]) => ({ cat, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      if (sortedCategories.length > 0) {
        // Doughnut chart
        charts.push({
          type: 'doughnut',
          title: 'Total Material Types Sold',
          data: {
            labels: sortedCategories.map(item => `${item.cat} (${item.count})`),
            datasets: [{
              label: 'Units Sold',
              data: sortedCategories.map(item => item.count),
              backgroundColor: [
                'rgba(59, 130, 246, 0.85)',
                'rgba(16, 185, 129, 0.85)',
                'rgba(245, 158, 11, 0.85)',
                'rgba(139, 92, 246, 0.85)',
                'rgba(236, 72, 153, 0.85)',
                'rgba(251, 146, 60, 0.85)',
                'rgba(20, 184, 166, 0.85)',
                'rgba(239, 68, 68, 0.85)',
                'rgba(99, 102, 241, 0.85)',
                'rgba(34, 197, 94, 0.85)',
              ],
              borderColor: '#fff',
              borderWidth: 3,
              hoverOffset: 15,
            }],
          },
        });

        // Horizontal bar chart for material types
        charts.push({
          type: 'bar',
          title: 'Material Types Comparison',
          options: {
            ...chartOptions,
            indexAxis: 'y',
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.06)',
                  lineWidth: 1,
                },
                ticks: {
                  font: { size: 12, weight: '500' },
                  color: '#6b7280',
                  padding: 8,
                },
              },
              y: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: { size: 11, weight: '500' },
                  color: '#6b7280',
                  padding: 8,
                  autoSkip: false,
                },
              },
            },
          },
          data: {
            labels: sortedCategories.map(item => item.cat),
            datasets: [{
              label: 'Units Sold',
              data: sortedCategories.map(item => item.count),
              backgroundColor: [
                'rgba(59, 130, 246, 0.85)',
                'rgba(16, 185, 129, 0.85)',
                'rgba(245, 158, 11, 0.85)',
                'rgba(139, 92, 246, 0.85)',
                'rgba(236, 72, 153, 0.85)',
                'rgba(251, 146, 60, 0.85)',
                'rgba(20, 184, 166, 0.85)',
                'rgba(239, 68, 68, 0.85)',
                'rgba(99, 102, 241, 0.85)',
                'rgba(34, 197, 94, 0.85)',
              ],
              borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(251, 146, 60, 1)',
                'rgba(20, 184, 166, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(99, 102, 241, 1)',
                'rgba(34, 197, 94, 1)',
              ],
              borderWidth: 2,
              borderRadius: 6,
              barThickness: 30,
            }],
          },
        });
      }
    }

    // Chart 4: Yearly Total Amount (Stacked Bar Chart)
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      const dateCol = dateColumns[0];
      
      // Find amount columns - look for exact matches first, then broader matches
      let amountColumn = columns.find(col => {
        const colLower = col.toLowerCase();
        return colLower === 'total amt' || 
               colLower === 'total amount' || 
               colLower === 'amt' ||
               colLower === 'amount';
      });
      
      // If not found, look for columns containing these keywords
      if (!amountColumn) {
        amountColumn = numericColumns.find(col => {
          const colLower = col.toLowerCase();
          return colLower.includes('amt') ||
                 colLower.includes('amount') ||
                 colLower.includes('price') ||
                 colLower.includes('revenue');
        });
      }
      
      // Use found amount column or first numeric column
      const columnsToUse = amountColumn ? [amountColumn] : numericColumns.slice(0, 1);
      
      // Aggregate by year
      const yearlyTotals = {};
      
      dataset.forEach(row => {
        const dateValue = row[dateCol];
        
        if (dateValue) {
          const year = extractYear(dateValue);
          if (year) {
            if (!yearlyTotals[year]) {
              yearlyTotals[year] = 0;
            }
            
            // Sum all relevant numeric columns
            columnsToUse.forEach(numCol => {
              const numValue = parseFloat(row[numCol]);
              if (!isNaN(numValue)) {
                yearlyTotals[year] += numValue;
              }
            });
          }
        }
      });
      
      const sortedYears = Object.keys(yearlyTotals).sort();
      
      if (sortedYears.length > 0) {
        // Find color column to create stacked bar chart
        const colorColumn = categoricalColumns.find(c => 
          c.toLowerCase().includes('color') || 
          c.toLowerCase().includes('colour')
        );

        if (colorColumn) {
          // Get unique colors
          const uniqueColors = [...new Set(dataset.map(row => row[colorColumn]))].filter(Boolean);
          
          // Aggregate amounts by year and color
          const colorYearData = {};
          
          dataset.forEach(row => {
            const dateValue = row[dateCol];
            const color = row[colorColumn] || 'Unknown';
            
            if (dateValue) {
              const year = extractYear(dateValue);
              if (year) {
                if (!colorYearData[color]) {
                  colorYearData[color] = {};
                }
                if (!colorYearData[color][year]) {
                  colorYearData[color][year] = 0;
                }
                
                columnsToUse.forEach(numCol => {
                  const numValue = parseFloat(row[numCol]);
                  if (!isNaN(numValue)) {
                    colorYearData[color][year] += numValue;
                  }
                });
              }
            }
          });

          // Create datasets for each color
          const colorDatasets = uniqueColors.map((color, idx) => {
            const colorNames = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'gray'];
            const colorValues = [
              'rgba(59, 130, 246, 0.85)',
              'rgba(34, 197, 94, 0.85)',
              'rgba(239, 68, 68, 0.85)',
              'rgba(251, 191, 36, 0.85)',
              'rgba(139, 92, 246, 0.85)',
              'rgba(236, 72, 153, 0.85)',
              'rgba(251, 146, 60, 0.85)',
              'rgba(17, 24, 39, 0.85)',
              'rgba(226, 232, 240, 0.85)',
              'rgba(107, 114, 128, 0.85)',
            ];
            
            // Try to match actual color to visual color
            const bgColor = getColorFromName(color) || colorValues[idx % colorValues.length];
            
            return {
              label: color,
              data: sortedYears.map(year => colorYearData[color]?.[year] || 0),
              backgroundColor: bgColor,
              borderColor: bgColor.replace('0.85', '1'),
              borderWidth: 1,
            };
          });

          // Stacked bar chart
          charts.push({
            type: 'bar',
            title: 'Total Amount by Year & Color (Stacked)',
            options: {
              ...amountChartOptions,
              scales: {
                ...amountChartOptions.scales,
                x: {
                  ...amountChartOptions.scales.x,
                  stacked: true,
                },
                y: {
                  ...amountChartOptions.scales.y,
                  stacked: true,
                },
              },
            },
            data: {
              labels: sortedYears,
              datasets: colorDatasets,
            },
          });
        } else {
          // Fallback: Simple bar chart if no color column
          charts.push({
            type: 'bar',
            title: 'Total Amount by Year',
            options: amountChartOptions,
            data: {
              labels: sortedYears,
              datasets: [{
                label: 'Total Amount',
                data: sortedYears.map(year => yearlyTotals[year]),
                backgroundColor: sortedYears.map((_, idx) => {
                  const colors = [
                    'rgba(59, 130, 246, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(245, 158, 11, 0.85)',
                    'rgba(139, 92, 246, 0.85)',
                    'rgba(236, 72, 153, 0.85)',
                    'rgba(251, 146, 60, 0.85)',
                  ];
                  return colors[idx % colors.length];
                }),
                borderWidth: 2,
                borderRadius: 8,
              }],
            },
          });
        }
      }
    }

    // Chart 5: Meters Sold Per Year (Line Chart)
    if (dateColumns.length > 0) {
      // Find meter/metre related columns
      const meterColumns = numericColumns.filter(col => 
        col.toLowerCase().includes('meter') || 
        col.toLowerCase().includes('metre')
      );
      
      // If no meter column, look for quantity or other numeric columns
      const relevantColumns = meterColumns.length > 0 
        ? meterColumns 
        : numericColumns.filter(col => 
            col.toLowerCase().includes('quantity') ||
            col.toLowerCase().includes('sales') || 
            col.toLowerCase().includes('production') ||
            col.toLowerCase().includes('amount')
          );
      
      if (relevantColumns.length > 0) {
        const yearCol = dateColumns[0];
        const salesCol = relevantColumns[0];
        
        // Extract years from date column
        const yearlyData = {};
        dataset.forEach(row => {
          const dateValue = row[yearCol];
          const salesValue = parseFloat(row[salesCol]);
          
          if (dateValue && !isNaN(salesValue)) {
            // Extract year from various date formats
            let year;
            if (dateValue.includes('-')) {
              year = dateValue.split('-')[0];
            } else if (dateValue.includes('/')) {
              const parts = dateValue.split('/');
              year = parts.length === 3 ? parts[2] : parts[0];
            } else if (dateValue.length === 4 && !isNaN(dateValue)) {
              year = dateValue;
            } else {
              // Try to extract 4-digit year
              const match = dateValue.match(/\d{4}/);
              year = match ? match[0] : null;
            }
            
            if (year) {
              if (!yearlyData[year]) {
                yearlyData[year] = [];
              }
              yearlyData[year].push(salesValue);
            }
          }
        });

        // Calculate total/average per year
        const yearlyTotals = Object.entries(yearlyData)
          .map(([year, values]) => ({
            year,
            total: values.reduce((sum, val) => sum + val, 0),
            average: values.reduce((sum, val) => sum + val, 0) / values.length,
            count: values.length
          }))
          .sort((a, b) => a.year.localeCompare(b.year));

        if (yearlyTotals.length > 0) {
          // Determine if it's meters or other quantity
          const isMeterColumn = salesCol.toLowerCase().includes('meter') || 
                                salesCol.toLowerCase().includes('metre');
          const chartTitle = isMeterColumn 
            ? 'Total Meters Sold Per Year' 
            : `Total ${salesCol} Per Year`;
          const datasetLabel = isMeterColumn 
            ? 'Meters Sold' 
            : `Total ${salesCol}`;
          
          charts.push({
            type: 'line',
            title: chartTitle,
            data: {
              labels: yearlyTotals.map(item => item.year),
              datasets: [{
                label: datasetLabel,
                data: yearlyTotals.map(item => item.total),
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 4,
                tension: 0.4,
                fill: true,
                pointRadius: 7,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointHoverRadius: 10,
                pointHoverBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3,
              }],
            },
          });

          // Add bar chart for comparison
          const barChartTitle = isMeterColumn 
            ? 'Year-over-Year Comparison - Meters Sold' 
            : `Year-over-Year Comparison - ${salesCol}`;
          
          charts.push({
            type: 'bar',
            title: barChartTitle,
            data: {
              labels: yearlyTotals.map(item => item.year),
              datasets: [{
                label: datasetLabel,
                data: yearlyTotals.map(item => item.total),
                backgroundColor: yearlyTotals.map((_, idx) => {
                  const colors = [
                    'rgba(99, 102, 241, 0.85)',
                    'rgba(139, 92, 246, 0.85)',
                    'rgba(168, 85, 247, 0.85)',
                    'rgba(59, 130, 246, 0.85)',
                    'rgba(14, 165, 233, 0.85)',
                  ];
                  return colors[idx % colors.length];
                }),
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
              }],
            },
          });
        }
      }
    }

    // Chart 7: Market Share / Concentration Analysis
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      const catCol = categoricalColumns[0];
      const numCol = numericColumns[0];
      
      const totalValue = dataset.reduce((sum, row) => {
        const val = parseFloat(row[numCol]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      const shareData = {};
      dataset.forEach(row => {
        const category = row[catCol] || 'Unknown';
        const value = parseFloat(row[numCol]);
        if (!isNaN(value)) {
          shareData[category] = (shareData[category] || 0) + value;
        }
      });

      const shareEntries = Object.entries(shareData)
        .map(([cat, val]) => ({
          category: cat,
          value: val,
          percentage: ((val / totalValue) * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      if (shareEntries.length > 0) {
        charts.push({
          type: 'doughnut',
          title: `Market Share Analysis - ${catCol} Contribution`,
          data: {
            labels: shareEntries.map(item => `${item.category} (${item.percentage}%)`),
            datasets: [{
              label: 'Share %',
              data: shareEntries.map(item => item.percentage),
              backgroundColor: [
                'rgba(59, 130, 246, 0.85)',
                'rgba(16, 185, 129, 0.85)',
                'rgba(245, 158, 11, 0.85)',
                'rgba(139, 92, 246, 0.85)',
                'rgba(236, 72, 153, 0.85)',
                'rgba(251, 146, 60, 0.85)',
              ],
              borderColor: '#fff',
              borderWidth: 3,
              hoverOffset: 12,
            }],
          },
        });
      }
    }

    return charts;
  }, [dataset, columns]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!dataset || dataset.length === 0) return null;

    const numericColumns = columns.filter(col => {
      const sampleValues = dataset.slice(0, 10).map(row => row[col]);
      return sampleValues.every(val => !isNaN(parseFloat(val)) && val !== '');
    });

    return {
      totalRecords: dataset.length,
      totalColumns: columns.length,
      numericColumns: numericColumns.length,
      categoricalColumns: columns.length - numericColumns.length,
    };
  }, [dataset, columns]);

  const renderChart = (chart) => {
    const options = chart.options || chartOptions;
    switch (chart.type) {
      case 'bar':
        return <Bar data={chart.data} options={options} />;
      case 'doughnut':
        return <Doughnut data={chart.data} options={{ ...options, scales: undefined }} />;
      case 'pie':
        return <Pie data={chart.data} options={{ ...options, scales: undefined }} />;
      case 'line':
        return <Line data={chart.data} options={options} />;
      case 'polarArea':
        return <PolarArea data={chart.data} options={options} />;
      case 'radar':
        return <Radar data={chart.data} options={options} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="shadow-xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Upload Your Dataset
          </CardTitle>
          <CardDescription>
            Upload a CSV or Excel file to visualize your data with interactive charts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="dataset-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-blue-400 hover:bg-blue-100"
                onClick={() => document.getElementById('dataset-upload').click()}
                disabled={loading}
              >
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                {loading ? 'Processing...' : 'Choose File (CSV or Excel)'}
              </Button>
            </label>
          </div>
          {fileName && (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-blue-200">
              <span className="text-sm font-medium text-slate-700">
                📁 {fileName}
              </span>
              <Badge className="bg-blue-600">{dataset?.length || 0} rows</Badge>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {summaryStats && (
        <Card className="shadow-xl border-2 bg-gradient-to-r from-slate-50 to-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Dataset Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-3xl font-bold text-blue-600">{summaryStats.totalRecords}</div>
                <div className="text-sm text-slate-600 mt-1">Total Records</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-3xl font-bold text-green-600">{summaryStats.totalColumns}</div>
                <div className="text-sm text-slate-600 mt-1">Total Columns</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-3xl font-bold text-purple-600">{summaryStats.numericColumns}</div>
                <div className="text-sm text-slate-600 mt-1">Numeric Columns</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-3xl font-bold text-amber-600">{summaryStats.categoricalColumns}</div>
                <div className="text-sm text-slate-600 mt-1">Text Columns</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {dataset && dataset.length > 0 && (
        <Card className="shadow-xl border-2">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-slate-600" />
              Data Preview
            </CardTitle>
            <CardDescription>First 5 rows of your dataset</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    {columns.map((col, idx) => (
                      <th key={idx} className="text-left p-3 font-semibold text-slate-700 bg-slate-50">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="p-3 text-slate-600">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {generateCharts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {generateCharts.map((chart, idx) => (
            <Card key={idx} className="shadow-xl border-2 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  {chart.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-96">
                  {renderChart(chart)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!dataset && (
        <Card className="shadow-xl border-2">
          <CardContent className="p-16 text-center">
            <div className="space-y-4">
              <FileSpreadsheet className="w-24 h-24 mx-auto text-slate-300" />
              <div>
                <h3 className="text-2xl font-semibold text-slate-600 mb-2">
                  No Dataset Uploaded
                </h3>
                <p className="text-slate-500">
                  Upload a CSV or Excel file to get started with data visualization
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600 mt-6">
                <Badge variant="outline">✓ CSV Files</Badge>
                <Badge variant="outline">✓ Excel Files (.xlsx, .xls)</Badge>
                <Badge variant="outline">✓ Automatic Chart Generation</Badge>
                <Badge variant="outline">✓ Interactive Visualizations</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomDatasetAnalytics;
