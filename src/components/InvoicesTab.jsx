import React from "react";
import QRCode from "qrcode.react";
export default function InvoicesTab({ /* props */ }) {
  // Generate invoice data...
  return (
    <div>
      <h2>Invoices</h2>
      {/* For each tenant/room, display invoice */}
      <div>
        <p>Tenant: Example</p>
        <p>Amount Due: ₹1234</p>
        <QRCode value="upi://pay?pa=..." />
      </div>
    </div>
  );
}