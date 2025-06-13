import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { Box, Typography, TextField, Button } from "@mui/material";

const SETTINGS_DB = "settings";

export default function Settings() {
  const [unitRate, setUnitRate] = useState(7);
  const [defaultServiceCharge, setDefaultServiceCharge] = useState(0);

  useEffect(() => {
    localforage.getItem(SETTINGS_DB).then(val => {
      if (val) {
        setUnitRate(val.unitRate || 7);
        setDefaultServiceCharge(val.defaultServiceCharge || 0);
      }
    });
  }, []);

  const saveSettings = () => {
    localforage.setItem(SETTINGS_DB, {
      unitRate,
      defaultServiceCharge,
    });
    alert("Settings saved!");
  };

  return (
    <Box mb={3}>
      <Typography variant="h5">Settings</Typography>
      <Box display="flex" gap={2} mt={1} alignItems="center">
        <TextField
          label="Electricity Unit Rate (₹/unit)"
          type="number"
          value={unitRate}
          onChange={e => setUnitRate(Number(e.target.value))}
        />
        <TextField
          label="Default Additional Service Charge (₹)"
          type="number"
          value={defaultServiceCharge}
          onChange={e => setDefaultServiceCharge(Number(e.target.value))}
        />
        <Button variant="contained" onClick={saveSettings}>
          Save
        </Button>
      </Box>
    </Box>
  );
}