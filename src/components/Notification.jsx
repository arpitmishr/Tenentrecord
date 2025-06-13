import React from "react";
export default function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="notification">
      {message}
      <button onClick={onClose}>✖</button>
    </div>
  );
}