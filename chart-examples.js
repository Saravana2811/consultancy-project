charts.push({
  type: 'pie',  // Changed from 'doughnut'
  title: `Distribution by ${col}`,
  data: {
    labels: sortedEntries.map(([key]) => key),
    datasets: [{
      label: 'Count',
      data: sortedEntries.map(([, value]) => value),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
      borderColor: '#fff',
      borderWidth: 3,
    }],
  },
});
charts.push({
  type: 'horizontalBar',
  title: `Top 10 by ${col}`,
  data: {
    labels: labels,
    datasets: [{
      label: col,
      data: values,
      backgroundColor: [
        'rgba(59, 130, 246, 0.9)',
        'rgba(59, 130, 246, 0.85)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(59, 130, 246, 0.75)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(59, 130, 246, 0.65)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(59, 130, 246, 0.55)',
        'rgba(59, 130, 246, 0.5)',
        'rgba(59, 130, 246, 0.45)',
      ],
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
    }],
  },
});

// ============================================
// EXAMPLE 3: Gradient Bar Chart
// ============================================
charts.push({
  type: 'bar',
  title: `Top 10 by ${col}`,
  data: {
    labels: labels,
    datasets: [{
      label: col,
      data: values,
      backgroundColor: values.map((_, idx) => {
        const intensity = 1 - (idx / 10) * 0.5;
        return `rgba(59, 130, 246, ${intensity})`;
      }),
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      borderRadius: 8,  // Rounded corners
    }],
  },
});

// ============================================
// EXAMPLE 4: Multi-Color Bar Chart
// ============================================
charts.push({
  type: 'bar',
  title: `Analysis by ${col}`,
  data: {
    labels: labels,
    datasets: [{
      label: col,
      data: values,
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(16, 185, 129, 0.8)',   // Green
        'rgba(245, 158, 11, 0.8)',   // Orange
        'rgba(139, 92, 246, 0.8)',   // Purple
        'rgba(236, 72, 153, 0.8)',   // Pink
        'rgba(20, 184, 166, 0.8)',   // Teal
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(249, 115, 22, 0.8)',   // Orange Red
        'rgba(168, 85, 247, 0.8)',   // Violet
        'rgba(14, 165, 233, 0.8)',   // Sky Blue
      ],
      borderColor: '#fff',
      borderWidth: 2,
    }],
  },
});

// ============================================
// EXAMPLE 5: Smooth Line Chart
// ============================================
charts.push({
  type: 'line',
  title: `${col2} Trend`,
  data: {
    labels: dataPoints.map((_, idx) => `Point ${idx + 1}`),
    datasets: [{
      label: col2,
      data: dataPoints.map(p => p.y),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 4,
      tension: 0.4,  // Curved lines
      fill: true,
      pointRadius: 6,  // Larger points
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 8,
    }],
  },
});

// ============================================
// EXAMPLE 6: Sharp Line Chart
// ============================================
charts.push({
  type: 'line',
  title: `${col2} vs ${col1}`,
  data: {
    labels: dataPoints.map((_, idx) => `Point ${idx + 1}`),
    datasets: [{
      label: col2,
      data: dataPoints.map(p => p.y),
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      borderWidth: 3,
      tension: 0,  // Sharp angles (no curve)
      fill: false,
      pointRadius: 5,
      pointBackgroundColor: 'rgba(16, 185, 129, 1)',
    }],
  },
});

// ============================================
// EXAMPLE 7: Area Chart with Gradient
// ============================================
// Note: You'll need to create gradient in the component
charts.push({
  type: 'line',
  title: `${col} Trend`,
  data: {
    labels: labels,
    datasets: [{
      label: col,
      data: values,
      borderColor: 'rgba(139, 92, 246, 1)',
      backgroundColor: 'rgba(139, 92, 246, 0.3)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointRadius: 0,  // No points
    }],
  },
});

// ============================================
// EXAMPLE 8: Stacked Bar Chart (Multiple Series)
// ============================================
charts.push({
  type: 'bar',
  title: 'Multi-Series Comparison',
  data: {
    labels: categories,
    datasets: [
      {
        label: 'Series 1',
        data: series1Data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        stack: 'Stack 0',
      },
      {
        label: 'Series 2',
        data: series2Data,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        stack: 'Stack 0',
      },
      {
        label: 'Series 3',
        data: series3Data,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        stack: 'Stack 0',
      }
    ],
  },
});

// ============================================
// CHART OPTIONS CONFIGURATIONS
// ============================================

// Option 1: Minimal - No Grid, Simple Legend
const minimalOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,  // Hide legend
    },
  },
  scales: {
    y: {
      grid: { display: false },
      ticks: { display: false },
    },
    x: {
      grid: { display: false },
    },
  },
};

// Option 2: Detailed - With Title and Grid
const detailedOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Chart Title Here',
      font: { size: 18, weight: 'bold' },
      padding: 20,
    },
    legend: {
      position: 'top',
      labels: {
        padding: 20,
        font: { size: 14 },
        usePointStyle: true,  // Circular legend markers
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      padding: 15,
      titleFont: { size: 16, weight: 'bold' },
      bodyFont: { size: 14 },
      borderColor: '#fff',
      borderWidth: 2,
      displayColors: true,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        borderDash: [5, 5],
      },
      ticks: {
        font: { size: 12 },
        padding: 10,
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: { size: 12 },
        maxRotation: 45,
        minRotation: 0,
      },
    },
  },
};

// Option 3: Dark Theme
const darkOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#f9fafb',
        font: { size: 13 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      titleColor: '#f9fafb',
      bodyColor: '#d1d5db',
    },
  },
  scales: {
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#9ca3af',
      },
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
      ticks: {
        color: '#9ca3af',
      },
    },
  },
};

// Option 4: For Horizontal Bar
const horizontalBarOptions = {
  indexAxis: 'y',  // This makes it horizontal
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    y: {
      grid: {
        display: false,
      },
    },
  },
};

// ============================================
// COLOR PALETTES
// ============================================

const colorPalettes = {
  // Modern Blue-Green
  blueGreen: [
    'rgba(59, 130, 246, 0.8)',
    'rgba(14, 165, 233, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(20, 184, 166, 0.8)',
    'rgba(16, 185, 129, 0.8)',
  ],
  
  // Warm Sunset
  sunset: [
    'rgba(249, 115, 22, 0.8)',
    'rgba(251, 146, 60, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(217, 119, 6, 0.8)',
  ],
  
  // Purple Rain
  purple: [
    'rgba(168, 85, 247, 0.8)',
    'rgba(147, 51, 234, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(124, 58, 237, 0.8)',
    'rgba(109, 40, 217, 0.8)',
  ],
  
  // Professional Corporate
  corporate: [
    'rgba(30, 58, 138, 0.8)',
    'rgba(29, 78, 216, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(96, 165, 250, 0.8)',
    'rgba(147, 197, 253, 0.8)',
  ],
  
  // Nature Green
  nature: [
    'rgba(21, 128, 61, 0.8)',
    'rgba(22, 163, 74, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(74, 222, 128, 0.8)',
    'rgba(134, 239, 172, 0.8)',
  ],
};

// ============================================
// HOW TO USE THESE EXAMPLES
// ============================================

/*
1. Open: client/src/components/pages/CustomDatasetAnalytics.jsx

2. Find the generateCharts function (around line 100)

3. Replace existing charts.push({...}) blocks with examples above

4. To change options, modify the chartOptions object (around line 280)

5. To change colors, replace backgroundColor arrays with colorPalettes

6. Save file and refresh browser to see changes

Example modification:
- Find: backgroundColor: ['rgba(59, 130, 246, 0.8)', ...]
- Replace with: backgroundColor: colorPalettes.sunset

*/
