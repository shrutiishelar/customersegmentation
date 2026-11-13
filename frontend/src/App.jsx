import { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import CustomersView from './components/customers/CustomersView';
import DatasetView from './components/dataset/DatasetView';
import SegmentationView from './components/segmentation/SegmentationView';
import MarketingView from './components/marketing/MarketingView';
import ReportsView from './components/reports/ReportsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'customers':
        return <CustomersView />;
      case 'dataset':
        return <DatasetView />;
      case 'segmentation':
        return <SegmentationView />;
      case 'marketing':
        return <MarketingView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveView()}
    </Layout>
  );
}
