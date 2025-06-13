import React from "react";
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Tabs,
  Tab
} from "@mui/material";
import RoomList from "./components/RoomList";
import TenantList from "./components/TenantList";
import ElectricityManager from "./components/ElectricityManager";
import ServiceManager from "./components/ServiceManager";
import InvoiceManager from "./components/InvoiceManager";
import Settings from "./components/Settings";

function App() {
  const [tab, setTab] = React.useState(0);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tenant & Room Management
          </Typography>
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="Rooms" />
          <Tab label="Tenants" />
          <Tab label="Electricity" />
          <Tab label="Services" />
          <Tab label="Invoices" />
          <Tab label="Settings" />
        </Tabs>
      </AppBar>
      <Container>
        <Box mt={2}>
          {tab === 0 && <RoomList />}
          {tab === 1 && <TenantList />}
          {tab === 2 && <ElectricityManager />}
          {tab === 3 && <ServiceManager />}
          {tab === 4 && <InvoiceManager />}
          {tab === 5 && <Settings />}
        </Box>
      </Container>
    </>
  );
}
export default App;