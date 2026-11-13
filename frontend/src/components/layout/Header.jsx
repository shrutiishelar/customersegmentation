import { useState, useEffect } from 'react';
import {
  Menu,
  Database,
  Cpu,
  Server,
  RefreshCw
} from 'lucide-react';
import { checkSystemStatus } from '../../services/api';

export default function Header({
  activeTab,
  setIsMobileOpen
}) {
  const [status, setStatus] = useState({
    apiConnected: false,
    mongoConnected: false,
    sparkConnected: false,
    details: "Checking connection..."
  });
  const [isChecking, setIsChecking] = useState(false);

  const fetchStatus = async () => {
    setIsChecking(true);
    const result = await checkSystemStatus();
    setStatus(result);
    setIsChecking(false);
  };

  useEffect(() => {
    let isMounted = true;
    checkSystemStatus().then((result) => {
      if (isMounted) {
        setStatus(result);
      }
    });

    const interval = setInterval(() => {
      checkSystemStatus().then((result) => {
        if (isMounted) {
          setStatus(result);
        }
      });
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getTabLabel = (id) => {
    switch (id) {
      case 'dashboard': return 'Executive Analytics Dashboard';
      case 'customers': return 'Customer Management Directory';
      case 'dataset': return 'Dataset Upload & Preprocessing';
      case 'segmentation': return 'Spark MLlib K-Means Segmentation';
      case 'marketing': return 'Marketing Strategies & Actionable Personas';
      case 'reports': return 'Segmentation Reports & CSV Export';
      default: return 'Customer Segmentation Analytics';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-[#09090b]/90 backdrop-blur-md border-b border-[#8b5cf6]/15">
      {/* Left section: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 lg:hidden focus:outline-hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>Project</span>
            <span className="text-[#8b5cf6]">/</span>
            <span className="text-gray-300 capitalize">{activeTab}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {getTabLabel(activeTab)}
          </h1>
        </div>
      </div>

      {/* Right section: System Services Connectivity Status */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Connection Status Badges */}
        <div className="hidden sm:flex items-center gap-2.5 p-1.5 px-3 rounded-xl bg-[#13131a] border border-[#8b5cf6]/20 text-xs">
          {/* Spring Boot API */}
          <div className="flex items-center gap-1.5" title={`Spring Boot Backend: ${status.apiConnected ? 'Connected' : 'Not Connected'}`}>
            <Server className={`w-3.5 h-3.5 ${status.apiConnected ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span className="hidden md:inline text-gray-400 font-medium">API:</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${status.apiConnected ? 'text-emerald-400' : 'text-amber-400'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.apiConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {status.apiConnected ? 'Live' : 'Not Connected'}
            </span>
          </div>

          <div className="w-px h-3.5 bg-gray-800" />

          {/* MongoDB */}
          <div className="flex items-center gap-1.5" title={`MongoDB: ${status.mongoConnected ? 'Connected' : 'Not Connected'}`}>
            <Database className={`w-3.5 h-3.5 ${status.mongoConnected ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span className="hidden md:inline text-gray-400 font-medium">MongoDB:</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${status.mongoConnected ? 'text-emerald-400' : 'text-amber-400'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.mongoConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {status.mongoConnected ? 'Live' : 'Not Connected'}
            </span>
          </div>

          <div className="w-px h-3.5 bg-gray-800" />

          {/* Apache Spark */}
          <div className="flex items-center gap-1.5" title={`Apache Spark Engine: ${status.sparkConnected ? 'Connected' : 'Not Connected'}`}>
            <Cpu className={`w-3.5 h-3.5 ${status.sparkConnected ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span className="hidden md:inline text-gray-400 font-medium">Spark:</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${status.sparkConnected ? 'text-emerald-400' : 'text-amber-400'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.sparkConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {status.sparkConnected ? 'Ready' : 'Not Connected'}
            </span>
          </div>
        </div>

        {/* Refresh Connectivity Button */}
        <button
          onClick={fetchStatus}
          disabled={isChecking}
          title="Verify Backend Connectivity"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#181824] hover:bg-[#201f30] text-gray-300 hover:text-white border border-[#8b5cf6]/25 transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8b5cf6] ${isChecking ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isChecking ? 'Pinging...' : 'Verify'}</span>
        </button>
      </div>
    </header>
  );
}
