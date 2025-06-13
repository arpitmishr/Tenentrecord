import React, { useEffect, useState } from "react";
import localforage from "localforage";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  List,
  ListItem,
  ListItemText
} from "@mui/material";

const TENANT_DB = "tenants";
const SETTINGS_DB = "settings";

export default function ServiceManager() {
  const [tenants, setTenants] = useState([]);
  const [selected, setSelected] = useState("");
  const [service, setService] = useState("");
  const [charge, setCharge] = useState("");
  const [defaultCharge, setDefaultCharge] = useState(0);

  useEffect(() => {
    localforage.getItem(TENANT_DB).then((data) => setTenants(data || []));
    localforage
      .getItem(SETTINGS_DB)
      .then((val) => setDefaultCharge(val?.defaultServiceCharge || 0));
  }, []);

  const addService = () => {
    setTenants((prev) => {
      const upd = prev.map((t) => {
        if (t.id === Number(selected)) {
          t.services = t.services || [];
          t.services.push({
            name: service,
            charge: Number(charge),
            date: new Date().toISOString().slice(0, 10)
          });
        }
        return t;
      });
      localforage.setItem(TENANT_DB, upd);
      return [...upd];
    });
    setService("");
    setCharge("");
  };

  return (
    <Box mb={3}>
      <Typography variant="h5">Additional Services</Typography>
      <Box display="flex" gap={2} mt={1}>
        <Select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">Select Tenant</MenuItem>
          {tenants.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name} ({t.room})
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Service Name"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
        <TextField
          label="Charge"
          value={charge}
          onChange={(e) => setCharge(e.target.value)}
          placeholder={`Default: ₹${defaultCharge}`}
        />
        <Button
          variant="contained"
          onClick={addService}
          disabled={!selected || !service || !charge}
        >
          Add
        </Button>
      </Box>
      <List>
        {tenants.map(
          (t) =>
            t.services &&
            t.services.length > 0 && (
              <ListItem key={t.id}>
                <ListItemText
                  primary={`${t.name} (${t.room})`}
                  secondary={t.services
                    .map(
                      (s) => `${s.name}: ₹${s.charge} (${s.date})`
                    )
                    .join(", ")}
                />
              </ListItem>
            )
        )}
      </List>
    </Box>
  );
}