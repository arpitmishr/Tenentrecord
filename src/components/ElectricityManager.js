import React, { useEffect, useState } from "react";
import localforage from "localforage";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select
} from "@mui/material";

const TENANT_DB = "tenants";
const SETTINGS_DB = "settings";

export default function ElectricityManager() {
  const [tenants, setTenants] = useState([]);
  const [selected, setSelected] = useState("");
  const [newMeter, setNewMeter] = useState("");
  const [settings, setSettings] = useState({ unitRate: 7 });

  useEffect(() => {
    localforage.getItem(TENANT_DB).then((data) => setTenants(data || []));
    localforage.getItem(SETTINGS_DB).then((val) =>
      setSettings(val || { unitRate: 7 })
    );
  }, []);

  const updateMeter = () => {
    setTenants((prev) => {
      const upd = prev.map((t) => {
        if (t.id === Number(selected)) {
          const prevUnit =
            t.meterHistory[t.meterHistory.length - 1]?.value || 0;
          t.meterHistory.push({
            date: new Date().toISOString().slice(0, 10),
            value: Number(newMeter)
          });
          t.lastUnitConsumed = Number(newMeter) - prevUnit;
        }
        return t;
      });
      localforage.setItem(TENANT_DB, upd);
      return [...upd];
    });
    setNewMeter("");
  };

  return (
    <Box mb={3}>
      <Typography variant="h5">Electricity Meter Update</Typography>
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
          label="Current Meter Reading"
          value={newMeter}
          onChange={(e) => setNewMeter(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={updateMeter}
          disabled={!selected || !newMeter}
        >
          Update
        </Button>
      </Box>
      <Typography variant="body2">
        Current Unit Rate: ₹{settings.unitRate}
      </Typography>
      <List>
        {tenants.map((t) => (
          <ListItem key={t.id}>
            <ListItemText
              primary={`${t.name} (${t.room})`}
              secondary={
                t.meterHistory && t.meterHistory.length > 1
                  ? `Prev: ${
                      t.meterHistory[t.meterHistory.length - 2].value
                    }, Curr: ${
                      t.meterHistory[t.meterHistory.length - 1].value
                    }, Consumed: ${t.lastUnitConsumed || 0}`
                  : "No meter update yet"
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}