import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bar, 
  Pie, 
  Doughnut, 
  Line 
} from 'react-chartjs-2';
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
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal, 
  AlertCircle, 
  Calendar, 
  Package,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { mockDashboardData } from '../data/mockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MetricCard = ({ label, value, type, trend }) => {
  const { formatCurrency, isPrivacyOn } = usePrivacy();
  const isPositive = trend.startsWith('+');

  const displayValue = () => {
    if (type === 'currency') return formatCurrency(value);
    if (type === 'percent') return `${value}%`;
    return value;
  };

  return (
    <div className="card metric-card">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <div className={`metric-trend ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend}</span>
        </div>
      </div>
      <h3 className="metric-value">{displayValue()}</h3>
    </div>
  );
};

const Dashboard = () => {
  const { isPrivacyOn, formatCurrency } = usePrivacy();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Chart Data
  const revenueData = {
    labels: mockDashboardData.charts.revenueVsTarget.labels,
    datasets: [
      {
        label: 'Revenue',
        data: mockDashboardData.charts.revenueVsTarget.revenue,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Target',
        data: mockDashboardData.charts.revenueVsTarget.target,
        backgroundColor: 'rgba(226, 232, 240, 0.8)',
        borderRadius: 4,
      }
    ],
  };

  const leadStatusData = {
    labels: mockDashboardData.charts.leadStatus.labels,
    datasets: [{
      data: mockDashboardData.charts.leadStatus.data,
      backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  return (
    <motion.div 
      className="dashboard-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">Export Data</button>
          <button className="btn btn-primary">Add Lead</button>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="metrics-grid">
        {mockDashboardData.metrics.map((m, i) => (
          <motion.div key={i} variants={itemVariants}>
            <MetricCard {...m} />
          </motion.div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="chart-grid">
        <motion.div className="card chart-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Revenue vs Target</h3>
            <MoreHorizontal size={20} className="icon-btn" />
          </div>
          <div className={`chart-container ${isPrivacyOn ? 'privacy-blur' : ''}`}>
            <Bar 
              data={revenueData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </motion.div>
      </div>

      {/* Alerts & Reminders Section */}
      <div className="alerts-grid">
        <motion.div className="card alert-card" variants={itemVariants}>
          <div className="card-header">
            <div className="header-title-group">
              <Calendar className="icon-primary" size={20} />
              <h3>Expiry Reminders (Next 20 Days)</h3>
            </div>
            <span className="badge badge-warning">{mockDashboardData.expiryReminders.length} Pending</span>
          </div>
          <div className="alert-list">
            {mockDashboardData.expiryReminders.map((reminder) => (
              <div key={reminder.id} className="alert-item">
                <div className="alert-info">
                  <div className="alert-type-tag">{reminder.type}</div>
                  <div>
                    <h4 className="item-title">{reminder.client}</h4>
                    <p className="item-subtitle">Expires on {reminder.expiryDate}</p>
                  </div>
                </div>
                <div className="alert-action">
                  <span className="days-badge">{reminder.daysLeft} days left</span>
                  <button className="icon-btn"><ArrowRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="card alert-card" variants={itemVariants}>
          <div className="card-header">
            <div className="header-title-group">
              <Package className="icon-danger" size={20} />
              <h3>Inventory Alerts (Low Stock)</h3>
            </div>
            <span className="badge badge-danger">{mockDashboardData.inventoryAlerts.length} Critical</span>
          </div>
          <div className="alert-list">
            {mockDashboardData.inventoryAlerts.map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className="alert-info">
                  <div className="alert-icon-container danger">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <h4 className="item-title">{alert.partName}</h4>
                    <p className="item-subtitle">Stock: {alert.currentStock} {alert.unit} (Min: {alert.minLevel})</p>
                  </div>
                </div>
                <div className="alert-action">
                  <button className="btn btn-sm btn-outline-danger">Order Now</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Service Interval Reminders */}
      <div className="alerts-grid">
        <motion.div className="card alert-card" variants={itemVariants}>
          <div className="card-header">
            <div className="header-title-group">
                <AlertCircle className="icon-info" size={20} />
                <h3>Scheduled Service Reminders</h3>
            </div>
            <span className="badge badge-info">Next 7 Days</span>
          </div>
          <div className="alert-list">
            <div className="alert-item">
                <div className="alert-info">
                    <div className="alert-type-tag interval">60d</div>
                    <div>
                        <h4 className="item-title">Desktop / Laptop Service</h4>
                        <p className="item-subtitle">5 Assets pending at Global Tech</p>
                    </div>
                </div>
                <div className="alert-action">
                    <button className="btn btn-sm btn-primary">Notify Customer</button>
                </div>
            </div>
            <div className="alert-item">
                <div className="alert-info">
                    <div className="alert-type-tag interval">10d</div>
                    <div>
                        <h4 className="item-title">Printer Cartridge Refill</h4>
                        <p className="item-subtitle">Status check for Spark Solutions</p>
                    </div>
                </div>
                <div className="alert-action">
                    <button className="btn btn-sm btn-primary">Notify Customer</button>
                </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="card alert-card" variants={itemVariants}>
          <div className="card-header">
            <div className="header-title-group">
              <MessageSquare className="icon-success" size={20} />
              <h3>Notification Center</h3>
            </div>
          </div>
          <div className="notification-stats">
            <div className="stat-row">
                <span>AMC Expiry Sent (Cust)</span>
                <span className="count success">12</span>
            </div>
            <div className="stat-row">
                <span>CMC Expiry Sent (Cust)</span>
                <span className="count success">8</span>
            </div>
            <div className="stat-row">
                <span>Low Stock Internal Alert</span>
                <span className="count danger">3</span>
            </div>
          </div>
          <button className="btn btn-full btn-ghost mt-4">View All Logs</button>
        </motion.div>
      </div>

      <div className="secondary-charts-grid">
         <motion.div className="card staff-ranking-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Staff Performance</h3>
          </div>
          <div className="staff-list">
            {mockDashboardData.staffPerformance.map((staff, i) => (
              <div key={i} className="staff-item">
                <div className="staff-info">
                  <div className="avatar">{staff.name[0]}</div>
                  <span className="staff-name">{staff.name}</span>
                </div>
                <span className="staff-revenue">{formatCurrency(staff.revenue)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="card chart-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Lead Distribution</h3>
          </div>
          <div className={`chart-container pie-chart ${isPrivacyOn ? 'privacy-blur' : ''}`}>
            <Pie data={leadStatusData} options={{ maintainAspectRatio: false }} />
          </div>
        </motion.div>

        <motion.div className="card chart-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Target Progress</h3>
          </div>
          <div className={`chart-container donut-chart ${isPrivacyOn ? 'privacy-blur' : ''}`}>
             <Doughnut 
              data={{
                  labels: ['Completed', 'Remaining'],
                  datasets: [{
                    data: [mockDashboardData.metrics[1].value, 100 - mockDashboardData.metrics[1].value],
                    backgroundColor: ['#10b981', '#f1f5f9'],
                    borderWidth: 0,
                  }]
                }} 
              options={{ 
                cutout: '80%',
                plugins: { legend: { display: false } },
                maintainAspectRatio: false
              }} 
            />
            <div className="donut-center">
              <span className="donut-value">{mockDashboardData.metrics[1].value}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="card chart-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Response Time Trend</h3>
          </div>
          <div className={`chart-container ${isPrivacyOn ? 'privacy-blur' : ''}`}>
             <Line 
                data={{
                  labels: mockDashboardData.charts.responseTime.labels,
                  datasets: [{
                    label: 'Minutes',
                    data: mockDashboardData.charts.responseTime.data,
                    borderColor: '#4f46e5',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  }]
                }} 
                options={{ maintainAspectRatio: false }} 
              />
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
