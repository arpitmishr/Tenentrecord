import React, { useState } from "react";

export default function RoomsTab({ rooms, setRooms, setNotification }) {
  const [roomName, setRoomName] = useState("");
  const [meter, setMeter] = useState("");
  const [error, setError] = useState("");

  const addRoom = (e) => {
    e.preventDefault();
    if (!roomName.trim() || !meter) {
      setError("Room name and initial meter are required.");
      return;
    }
    setRooms([...rooms, { id: Date.now(), name: roomName, meter: Number(meter) }]);
    setRoomName(""); setMeter(""); setError("");
    setNotification("Room added successfully!");
  };

  const deleteRoom = (id) => {
    setRooms(rooms.filter(r => r.id !== id));
    setNotification("Room deleted.");
  };

  return (
    <div>
      <h2>Add Room</h2>
      <form className="form" onSubmit={addRoom}>
        <input
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
          placeholder="Room Name"
          required
        />
        <input
          type="number"
          value={meter}
          onChange={e => setMeter(e.target.value)}
          placeholder="Initial Meter"
          required
        />
        <button type="submit">Add</button>
      </form>
      {error && <div className="error">{error}</div>}
      <h3>All Rooms</h3>
      <ul>
        {rooms.map(r => (
          <li key={r.id}>
            {r.name} (Meter: {r.meter})
            <button className="delete" onClick={() => deleteRoom(r.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}