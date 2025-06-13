import React, { useEffect, useState, useRef } from "react";
import localforage from "localforage";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  InputLabel
} from "@mui/material";

const TENANT_DB = "tenants";
const SETTINGS_DB = "settings";
const INVOICE_DB = "invoices";

export default function InvoiceManager() {
  const [tenants, setTenants] = useState([]);
  const [settings, setSettings] = useState({ unitRate: 7, defaultServiceCharge: 0 });
  const [open, setOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [qrFile, setQrFile] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [unitUsed, setUnitUsed] = useState("");
  const [extraCharge, setExtraCharge] = useState("");
  const [invoiceList, setInvoiceList] = useState([]);
  const qrInputRef = useRef();

  useEffect(() => {
    localforage.getItem(TENANT_DB).then(val => setTenants(val || []));
    localforage.getItem(SETTINGS_DB).then(val => setSettings(val || { unitRate: 7, defaultServiceCharge: 0 }));
    localforage.getItem(INVOICE_DB).then(val => setInvoiceList(val || []));
  }, []);

  const openDialog = () => {
    setOpen(true);
    setQrFile(null);
    setSelectedTenant("");
    setInvoiceAmount("");
    setUnitUsed("");
    setExtraCharge("");
  };

  const closeDialog = () => setOpen(false);

  const handleQrChange = e => {
    if (e.target.files && e.target.files[0]) {
      setQrFile(e.target.files[0]);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedTenant || !invoiceAmount) return alert("Select tenant and amount!");
    let qrDataUrl = "";
    if (qrFile) {
      qrDataUrl = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(qrFile);
      });
    }
    const invoice = {
      id: Date.now(),
      tenantId: selectedTenant,
      invoiceAmount: Number(invoiceAmount),
      unitUsed: Number(unitUsed),
      unitRate: settings.unitRate,
      extraCharge: Number(extraCharge),
      qrDataUrl,
      date: new Date().toISOString().slice(0, 10),
    };
    const newList = [invoice, ...invoiceList];
    setInvoiceList(newList);
    localforage.setItem(INVOICE_DB, newList);
    setOpen(false);
  };

  return (
    <Box mb={3}>
      <Typography variant="h5">Invoices</Typography>
      <Button variant="contained" onClick={openDialog}>Generate Invoice</Button>
      <List>
        {invoiceList.map(inv => {
          const tenant = tenants.find(t => t.id === Number(inv.tenantId));
          return (
            <ListItem key={inv.id} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
              <ListItemText
                primary={`Tenant: ${tenant ? tenant.name : "?"} | Date: ${inv.date}`}
                secondary={
                  <>
                    <div>Amount: ₹{inv.invoiceAmount}</div>
                    <div>Units: {inv.unitUsed} × ₹{inv.unitRate} = ₹{inv.unitUsed * inv.unitRate}</div>
                    <div>Extra: ₹{inv.extraCharge}</div>
                    {inv.qrDataUrl && (
                      <div>
                        <b>Payment QR:</b><br />
                        <img src={inv.qrDataUrl} alt="QR" width={120} />
                      </div>
                    )}
                  </>
                }
              />
            </ListItem>
          );
        })}
      </List>
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <InputLabel>Select Tenant</InputLabel>
          <Select value={selectedTenant} onChange={e => setSelectedTenant(e.target.value)} displayEmpty>
            <MenuItem value="">Select</MenuItem>
            {tenants.map(t => (
              <MenuItem key={t.id} value={t.id}>{t.name} ({t.room})</MenuItem>
            ))}
          </Select>
          <TextField label="Units Used" value={unitUsed} type="number" onChange={e => setUnitUsed(e.target.value)} />
          <TextField label="Extra Service Charge" value={extraCharge} type="number" onChange={e => setExtraCharge(e.target.value)} />
          <TextField
            label="Total Amount"
            value={invoiceAmount}
            type="number"
            onChange={e => setInvoiceAmount(e.target.value)}
            helperText="Include rent, electricity and extra charges"
          />
          <Button variant="outlined" component="label">
            Upload QR Code (image)
            <input hidden accept="image/*" type="file" ref={qrInputRef} onChange={handleQrChange} />
          </Button>
          {qrFile && <img src={URL.createObjectURL(qrFile)} alt="qr preview" width={120} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateInvoice}>Create Invoice</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}