import React, { useEffect, useState } from "react";
import localforage from "localforage";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  MenuItem,
  Select,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const TENANT_DB = "tenants";
const ROOM_DB = "rooms";

export default function TenantList() {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    name: "",
    room: "",
    checkIn: "",
    verified: false,
    rent: "",
    prevMeter: ""
  });

  useEffect(() => {
    localforage.getItem(TENANT_DB).then((data) => setTenants(data || []));
    localforage.getItem(ROOM_DB).then((data) => setRooms(data || []));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const addTenant = () => {
    if (!form.name || !form.room || !form.checkIn) return;
    const newTenants = [
      ...tenants,
      {
        ...form,
        id: Date.now(),
        services: [],
        meterHistory: [
          { date: form.checkIn, value: Number(form.prevMeter) || 0 }
        ]
      }
    ];
    setTenants(newTenants);
    localforage.setItem(TENANT_DB, newTenants);
    setForm({
      name: "",
      room: "",
      checkIn: "",
      verified: false,
      rent: "",
      prevMeter: ""
    });
  };

  const deleteTenant = (id) => {
    const newTenants = tenants.filter((t) => t.id !== id);
    setTenants(newTenants);
    localforage.setItem(TENANT_DB, newTenants);
  };

  return (
    <Box mb={3}>
      <Typography variant="h5">Tenants</Typography>
      <Box display="flex" gap={2} mt={1}>
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <Select
          label="Room"
          name="room"
          value={form.room}
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="">Room</MenuItem>
          {rooms.map((room) => (
            <MenuItem key={room.id} value={room.name}>
              {room.name}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Check-in Date"
          name="checkIn"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={form.checkIn}
          onChange={handleChange}
        />
        <TextField
          label="Rent"
          name="rent"
          value={form.rent}
          onChange={handleChange}
        />
        <TextField
          label="Prev Meter"
          name="prevMeter"
          value={form.prevMeter}
          onChange={handleChange}
        />
        <Checkbox
          name="verified"
          checked={form.verified}
          onChange={handleChange}
        />{" "}
        Verified
        <Button variant="contained" onClick={addTenant}>
          Add Tenant
        </Button>
      </Box>
      <List>
        {tenants.map((tenant) => (
          <ListItem
            key={tenant.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteTenant(tenant.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${tenant.name} (${tenant.room})`}
              secondary={`Check-in: ${tenant.checkIn} | Rent: ₹${tenant.rent} | Verified: ${
                tenant.verified ? "Yes" : "No"
              }`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}