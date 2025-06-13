import React, { useState } from "react";
import RoomsTab from "./components/RoomsTab";
import TenantsTab from "./components/TenantsTab";
import ElectricityTab from "./components/ElectricityTab";
import ServicesTab from "./components/ServicesTab";
import InvoicesTab from "./components/InvoicesTab";
import SettingsTab from "./components/SettingsTab";
import Notification from "./components/Notification";
import './styles.css';

const TABS = [
  "Rooms", "Tenants", "Electricity", "Services", "Invoices", "Settings"
];

export default function App() {
  const [activeTab, setActiveTab] = useState("Rooms");
  const [notification, setNotification] = useState(null);

  // Global state for rooms, tenants, etc. (could use Context API or Redux for larger apps)
  const [rooms, setRooms] = useState(() => JSON.parse(localStorage.getItem('rooms') || '[]'));
  const [tenants, setTenants] = useState(() => JSON.parse(localStorage.getItem('tenants') || '[]'));
  const [services, setServices] = useState(() => JSON.parse(localStorage.getItem('services') || '[]'));
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('settings') || '{}'));

  // Persist state to localStorage
  React.useEffect(() => { localStorage.setItem('rooms', JSON.stringify(rooms)); }, [rooms]);
  React.useEffect(() => { localStorage.setItem('tenants', JSON.stringify(tenants)); }, [tenants]);
  React.useEffect(() => { localStorage.setItem('services', JSON.stringify(services)); }, [services]);
  React.useEffect(() => { localStorage.setItem('settings', JSON.stringify(settings)); }, [settings]);

  // Pass notification setter to children for global error/success messages
  const tabProps = { rooms, setRooms, tenants, setTenants, services, setServices, settings, setSettings, setNotification };

  return (
    <div className="container">
      <h1>Tenant & Room Manager</h1>
      <nav className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >{tab}</button>
        ))}
      </nav>
      <div className="tab-content">
        {activeTab === "Rooms" && <RoomsTab {...tabProps} />}
        {activeTab === "Tenants" && <TenantsTab {...tabProps} />}
        {activeTab === "Electricity" && <ElectricityTab {...tabProps} />}
        {activeTab === "Services" && <ServicesTab {...tabProps} />}
        {activeTab === "Invoices" && <InvoicesTab {...tabProps} />}
        {activeTab === "Settings" && <SettingsTab {...tabProps} />}
      </div>
      <Notification message={notification} onClose={() => setNotification(null)} />
    </div>
  );
}