
import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/Card';
import { dbService } from '../services/dbService';
import { Tenant, Room } from '../types';
import { UsersIcon, BuildingOfficeIcon, BoltIcon, WrenchScrewdriverIcon } from '../components/Icons';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { PlusCircleIcon } from '../components/Icons';

export const DashboardPage: React.FC = () => {
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [occupiedRooms, setOccupiedRooms] = useState(0);
  const [totalElectricityDue, setTotalElectricityDue] = useState(0);
  const [totalServicesDue, setTotalServicesDue] = useState(0);

  const fetchData = async () => {
    try {
      const tenants = await dbService.getAllTenants();
      const rooms = await dbService.getAllRooms();
      const electricityReadings = await dbService.getAllElectricityReadings();
      const additionalServices = await dbService.getAllAdditionalServices();

      setTotalTenants(tenants.length);
      setTotalRooms(rooms.length);
      
      const occupiedCount = tenants.filter(t => t.roomId !== null).length;
      setOccupiedRooms(occupiedCount);

      const unpaidElectricity = electricityReadings
        .filter(r => !r.isPaid)
        .reduce((sum, r) => sum + r.totalCharge, 0);
      setTotalElectricityDue(unpaidElectricity);

      const unpaidServices = additionalServices
        .filter(s => !s.isPaid)
        .reduce((sum, s) => sum + s.charge, 0);
      setTotalServicesDue(unpaidServices);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // TODO: Add user-friendly error notification
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-100">Dashboard</h2>
        <div className="space-x-2">
            <Link to="/tenants">
                <Button variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>Add Tenant</Button>
            </Link>
            <Link to="/rooms">
                <Button variant="secondary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>Add Room</Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard title="Total Tenants" value={totalTenants} icon={<UsersIcon className="w-8 h-8" />} />
        <StatCard title="Total Rooms" value={totalRooms} icon={<BuildingOfficeIcon className="w-8 h-8" />} colorClass="text-emerald-400" />
        <StatCard title="Occupied Rooms" value={`${occupiedRooms} / ${totalRooms}`} icon={<BuildingOfficeIcon className="w-8 h-8" />} colorClass="text-amber-400" />
        <StatCard title="Vacant Rooms" value={totalRooms - occupiedRooms} icon={<BuildingOfficeIcon className="w-8 h-8" />} colorClass="text-green-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <StatCard 
            title="Total Electricity Due" 
            value={totalElectricityDue.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} // Update currency as needed
            icon={<BoltIcon className="w-8 h-8" />} 
            colorClass="text-yellow-400" 
        />
        <StatCard 
            title="Total Services Due" 
            value={totalServicesDue.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} // Update currency as needed
            icon={<WrenchScrewdriverIcon className="w-8 h-8" />} 
            colorClass="text-purple-400" 
        />
      </div>

      <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Quick Links</h3>
        <div className="flex flex-wrap gap-4">
          <Link to="/tenants" className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-150 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" /> Manage Tenants
          </Link>
          <Link to="/rooms" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-150 flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 mr-2" /> Manage Rooms
          </Link>
        </div>
      </div>
       <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Recent Activity (Placeholder)</h3>
        <p className="text-gray-400">This section can show recent tenant move-ins, payments, or new readings.</p>
        <ul className="mt-2 space-y-2 text-gray-300">
            <li>- John Doe moved into Room 101.</li>
            <li>- Electricity reading added for Jane Smith.</li>
            <li>- New room #205 added.</li>
        </ul>
      </div>
    </div>
  );
};
