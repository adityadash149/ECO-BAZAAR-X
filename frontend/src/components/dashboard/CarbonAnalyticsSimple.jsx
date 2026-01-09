import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Leaf,
  TrendingUp,
  TreePine,
  Target,
  Award,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const CarbonAnalyticsSimple = ({ sellerId, sellerOrders = [] }) => {

  // Real-world carbon calculation formulas
  const calculateCarbonSaved = (order) => {
    const baseCarbonPerKg = 0.5; // kg CO2 per kg of product
    const ecoFriendlyMultiplier = 0.3; // 70% reduction for eco-friendly products
    const shippingCarbon = 0.1; // kg CO2 per order for shipping
    const packagingCarbon = 0.05; // kg CO2 per order for packaging
    
    let totalCarbon = 0;
    let carbonSaved = 0;
    
    order.orderItems?.forEach(item => {
      const productWeight = item.product?.weight || 1; // kg
      const quantity = item.quantity;
      
      // Base carbon footprint
      const baseCarbon = productWeight * quantity * baseCarbonPerKg;
      
      // Eco-friendly reduction
      if (item.product?.isEcoFriendly) {
        const ecoCarbon = baseCarbon * ecoFriendlyMultiplier;
        carbonSaved += baseCarbon - ecoCarbon;
        totalCarbon += ecoCarbon;
      } else {
        totalCarbon += baseCarbon;
      }
    });
    
    // Add shipping and packaging
    totalCarbon += shippingCarbon + packagingCarbon;
    
    return {
      totalCarbon: totalCarbon,
      carbonSaved: carbonSaved,
      isEcoFriendly: order.orderItems?.some(item => item.product?.isEcoFriendly)
    };
  };

  // Calculate real analytics from orders
  const calculateRealAnalytics = () => {
    if (!sellerOrders || sellerOrders.length === 0) {
      return {
        totalCarbonSaved: 0,
        totalOrders: 0,
        ecoFriendlyOrders: 0,
        totalRevenue: 0,
        carbonEfficiency: 0,
        ecoFriendlyPercentage: 0,
        orderAnalytics: []
      };
    }

    let totalCarbonSaved = 0;
    let totalCarbonEmitted = 0;
    let totalOrders = sellerOrders.length;
    let ecoFriendlyOrders = 0;
    let totalRevenue = 0;
    
    const orderAnalytics = sellerOrders.map(order => {
      const carbonData = calculateCarbonSaved(order);
      totalCarbonSaved += carbonData.carbonSaved;
      totalCarbonEmitted += carbonData.totalCarbon;
      totalRevenue += order.totalPrice || 0;
      
      if (carbonData.isEcoFriendly) {
        ecoFriendlyOrders++;
      }
      
      return {
        ...order,
        carbonData,
        carbonScore: carbonData.carbonSaved / (carbonData.totalCarbon + carbonData.carbonSaved),
        efficiency: carbonData.carbonSaved / (order.totalPrice || 1)
      };
    });

    const carbonEfficiency = totalCarbonSaved / (totalCarbonEmitted + totalCarbonSaved);
    const ecoFriendlyPercentage = (ecoFriendlyOrders / totalOrders) * 100;


    return {
      totalCarbonSaved: totalCarbonSaved,
      totalOrders: totalOrders,
      ecoFriendlyOrders: ecoFriendlyOrders,
      totalRevenue: totalRevenue,
      carbonEfficiency: carbonEfficiency,
      ecoFriendlyPercentage: ecoFriendlyPercentage,
      orderAnalytics: orderAnalytics
    };
  };

  // Calculate real data
  const realData = calculateRealAnalytics();

  // Prepare chart data
  const prepareChartData = () => {
    // Daily trends data (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = sellerOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      let dayCarbonSaved = 0;
      let dayRevenue = 0;
      dayOrders.forEach(order => {
        const carbonData = calculateCarbonSaved(order);
        dayCarbonSaved += carbonData.carbonSaved;
        dayRevenue += order.totalPrice || 0;
      });
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        carbonSaved: dayCarbonSaved,
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    // Category data
    const categoryData = {};
    realData.orderAnalytics.forEach(order => {
      order.orderItems?.forEach(item => {
        const category = item.product?.category || 'Other';
        if (!categoryData[category]) {
          categoryData[category] = {
            carbonSaved: 0,
            revenue: 0,
            orders: 0
          };
        }
        categoryData[category].carbonSaved += order.carbonData.carbonSaved;
        categoryData[category].revenue += order.totalPrice || 0;
        categoryData[category].orders += 1;
      });
    });

    const categoryChartData = Object.entries(categoryData).map(([category, data]) => ({
      category,
      carbonSaved: data.carbonSaved,
      revenue: data.revenue,
      orders: data.orders
    }));

    return { dailyData, categoryChartData };
  };

  const { dailyData, categoryChartData } = prepareChartData();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              Carbon Analytics
            </h2>
            <p className="text-gray-600 mt-1">Track your environmental impact and optimize sustainability</p>
          </div>
          
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>


        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Carbon Saved</p>
                <p className="text-3xl font-bold text-green-700">{realData.totalCarbonSaved.toFixed(2)} kg</p>
                <p className="text-sm text-green-600">CO₂ equivalent</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Eco-Friendly Orders</p>
                <p className="text-3xl font-bold text-blue-700">{realData.ecoFriendlyOrders}</p>
                <p className="text-sm text-blue-600">{realData.ecoFriendlyPercentage.toFixed(1)}% of total</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Efficiency Score</p>
                <p className="text-3xl font-bold text-purple-700">{(realData.carbonEfficiency * 100).toFixed(1)}%</p>
                <p className="text-sm text-purple-600">Carbon efficiency</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Revenue Impact</p>
                <p className="text-3xl font-bold text-orange-700">₹{(realData.totalRevenue / 1000).toFixed(1)}k</p>
                <p className="text-sm text-orange-600">From eco-friendly sales</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Carbon Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Carbon Impact Trends</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Carbon Saved (kg)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  `${value.toFixed(2)} kg`,
                  name === 'carbonSaved' ? 'Carbon Saved' : name
                ]}
              />
              <Area
                type="monotone"
                dataKey="carbonSaved"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                dataKey="carbonSaved"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ category, carbonSaved }) => 
                  `${category}: ${carbonSaved.toFixed(1)}kg`
                }
              >
                {categoryChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  `${value.toFixed(2)} kg`,
                  name === 'carbonSaved' ? 'Carbon Saved' : name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue vs Carbon Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue vs Carbon Impact</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Revenue (₹)</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Carbon (kg)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'revenue' ? `₹${value.toFixed(0)}` : `${value.toFixed(2)} kg`,
                  name === 'revenue' ? 'Revenue' : 'Carbon Saved'
                ]}
              />
              <Bar 
                yAxisId="left"
                dataKey="revenue" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Revenue"
              />
              <Bar 
                yAxisId="right"
                dataKey="carbonSaved" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                name="Carbon Saved"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Efficiency Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Efficiency Analysis</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realData.orderAnalytics.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="id" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `#${value}`}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  `${(value * 100).toFixed(1)}%`,
                  name === 'carbonScore' ? 'Efficiency Score' : name
                ]}
              />
              <Line
                type="monotone"
                dataKey="carbonScore"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Insights & Recommendations</h3>
          <Award className="w-5 h-5 text-yellow-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-l-4 ${
            realData.carbonEfficiency > 0.7 
              ? 'bg-green-50 border-green-500' 
              : realData.carbonEfficiency > 0.5 
              ? 'bg-blue-50 border-blue-500' 
              : 'bg-orange-50 border-orange-500'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                realData.carbonEfficiency > 0.7 
                  ? 'bg-green-100 text-green-600' 
                  : realData.carbonEfficiency > 0.5 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-orange-100 text-orange-600'
              }`}>
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {realData.carbonEfficiency > 0.7 
                    ? 'Excellent Carbon Efficiency!' 
                    : realData.carbonEfficiency > 0.5 
                    ? 'Good Carbon Performance' 
                    : 'Carbon Efficiency Needs Improvement'}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  You're achieving {(realData.carbonEfficiency * 100).toFixed(1)}% carbon efficiency.
                  {realData.carbonEfficiency > 0.7 ? ' Keep up the great work!' : ' There\'s room for improvement.'}
                </p>
                <p className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded">
                  💡 {realData.carbonEfficiency > 0.7 
                    ? 'Continue your current eco-friendly practices.' 
                    : 'Consider adding more eco-friendly products to your catalog.'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-l-4 ${
            realData.ecoFriendlyPercentage > 70 
              ? 'bg-green-50 border-green-500' 
              : realData.ecoFriendlyPercentage > 30 
              ? 'bg-blue-50 border-blue-500' 
              : 'bg-orange-50 border-orange-500'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                realData.ecoFriendlyPercentage > 70 
                  ? 'bg-green-100 text-green-600' 
                  : realData.ecoFriendlyPercentage > 30 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-orange-100 text-orange-600'
              }`}>
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {realData.ecoFriendlyPercentage > 70 
                    ? 'Outstanding Eco-Friendly Performance!' 
                    : realData.ecoFriendlyPercentage > 30 
                    ? 'Good Eco-Friendly Ratio' 
                    : 'Low Eco-Friendly Product Ratio'}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {realData.ecoFriendlyPercentage.toFixed(1)}% of your orders are eco-friendly.
                  {realData.ecoFriendlyPercentage < 30 ? ' Focus on eco-friendly products.' : ''}
                </p>
                <p className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded">
                  💡 {realData.ecoFriendlyPercentage > 70 
                    ? 'You\'re a sustainability leader! Share your success story.' 
                    : realData.ecoFriendlyPercentage < 30 
                    ? 'Increase your eco-friendly product catalog by 50%.' 
                    : 'Consider adding more sustainable alternatives.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border-l-4 bg-blue-50 border-blue-500">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Revenue Impact Analysis</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Total revenue: ₹{realData.totalRevenue.toFixed(0)} from {realData.totalOrders} orders.
                  {realData.totalRevenue > 0 && ` Average: ₹${(realData.totalRevenue / realData.totalOrders).toFixed(0)} per order.`}
                </p>
                <p className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded">
                  💡 {realData.totalRevenue > 0 
                    ? 'Your eco-friendly products are generating good revenue!' 
                    : 'Start selling to see revenue impact.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order-Level Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Order-Level Carbon Impact</h3>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{sellerOrders?.length || 0} orders</span>
          </div>
        </div>
        
        {realData.orderAnalytics && realData.orderAnalytics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Carbon Saved</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Efficiency</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {realData.orderAnalytics.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">₹{order.totalPrice?.toFixed(2) || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <TreePine className="w-4 h-4 text-green-500 mr-1" />
                        <span className="font-medium text-green-600">
                          {order.carbonData.carbonSaved.toFixed(2)} kg
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              order.carbonScore > 0.7
                                ? 'bg-green-500'
                                : order.carbonScore > 0.4
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${order.carbonScore * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {(order.carbonScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.carbonData.isEcoFriendly
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.carbonData.isEcoFriendly ? 'Eco-Friendly' : 'Standard'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Available</h3>
            <p className="text-gray-600">Start selling products to see your carbon impact analytics!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarbonAnalyticsSimple;
