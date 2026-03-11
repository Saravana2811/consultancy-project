import { useMemo } from 'react';
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
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, PieChart, BarChart3, Activity } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = ({ materials }) => {
  // Category Distribution Data
  const categoryData = useMemo(() => {
    const categoryCount = materials.reduce((acc, material) => {
      const category = material.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryCount),
      datasets: [
        {
          label: 'Materials by Category',
          data: Object.values(categoryCount),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',   // blue
            'rgba(16, 185, 129, 0.8)',   // green
            'rgba(245, 158, 11, 0.8)',   // amber
            'rgba(239, 68, 68, 0.8)',    // red
            'rgba(139, 92, 246, 0.8)',   // purple
            'rgba(236, 72, 153, 0.8)',   // pink
            'rgba(20, 184, 166, 0.8)',   // teal
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(20, 184, 166, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [materials]);

  // Inventory Status Data
  const inventoryData = useMemo(() => {
    const inStock = materials.filter(m => m.quantity > 10).length;
    const lowStock = materials.filter(m => m.quantity > 0 && m.quantity <= 10).length;
    const outOfStock = materials.filter(m => m.quantity === 0).length;

    return {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [
        {
          label: 'Number of Materials',
          data: [inStock, lowStock, outOfStock],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [materials]);

  // Top Materials by Value
  const topMaterialsData = useMemo(() => {
    const sortedMaterials = [...materials]
      .map(m => ({
        title: m.title,
        value: m.price * m.quantity,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      labels: sortedMaterials.map(m => m.title.length > 20 ? m.title.substring(0, 20) + '...' : m.title),
      datasets: [
        {
          label: 'Total Value (Rs.)',
          data: sortedMaterials.map(m => m.value),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        },
      ],
    };
  }, [materials]);

  // Price Range Distribution
  const priceRangeData = useMemo(() => {
    const ranges = {
      '0-100': 0,
      '101-500': 0,
      '501-1000': 0,
      '1001-2000': 0,
      '2000+': 0,
    };

    materials.forEach(m => {
      const price = m.price;
      if (price <= 100) ranges['0-100']++;
      else if (price <= 500) ranges['101-500']++;
      else if (price <= 1000) ranges['501-1000']++;
      else if (price <= 2000) ranges['1001-2000']++;
      else ranges['2000+']++;
    });

    return {
      labels: Object.keys(ranges),
      datasets: [
        {
          label: 'Number of Materials',
          data: Object.values(ranges),
          borderColor: 'rgba(139, 92, 246, 1)',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [materials]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (materials.length === 0) {
    return (
      <Card className="shadow-xl border-2">
        <CardContent className="p-12 text-center">
          <Activity className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">No Data Available</h3>
          <p className="text-slate-500">Add materials to see analytics and insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="shadow-xl border-2 hover:shadow-2xl transition-shadow">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Materials by Category
            </CardTitle>
            <CardDescription>Distribution of materials across categories</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <Doughnut data={categoryData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card className="shadow-xl border-2 hover:shadow-2xl transition-shadow">
          <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Inventory Status
            </CardTitle>
            <CardDescription>Stock levels across all materials</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <Bar data={inventoryData} options={barOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Top Materials by Value */}
        <Card className="shadow-xl border-2 hover:shadow-2xl transition-shadow">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-violet-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Top 5 Materials by Value
            </CardTitle>
            <CardDescription>Highest value materials in inventory</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <Bar data={topMaterialsData} options={barOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Price Range Distribution */}
        <Card className="shadow-xl border-2 hover:shadow-2xl transition-shadow">
          <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600" />
              Price Range Distribution
            </CardTitle>
            <CardDescription>Materials grouped by price range (Rs.)</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <Line data={priceRangeData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="shadow-xl border-2 bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader className="border-b">
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {materials.reduce((sum, m) => sum + m.quantity, 0)}
              </div>
              <div className="text-sm text-slate-600 mt-1">Total Units</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                Rs.{materials.length > 0 ? Math.round(materials.reduce((sum, m) => sum + m.price, 0) / materials.length) : 0}
              </div>
              <div className="text-sm text-slate-600 mt-1">Avg. Price</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                Rs.{Math.max(...materials.map(m => m.price), 0)}
              </div>
              <div className="text-sm text-slate-600 mt-1">Highest Price</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-amber-600">
                {new Set(materials.map(m => m.category)).size}
              </div>
              <div className="text-sm text-slate-600 mt-1">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
