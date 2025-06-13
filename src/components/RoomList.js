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
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const ROOM_DB = "rooms";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [meter, setMeter] = useState("");

  useEffect(() => {
    localforage.getItem(ROOM_DB).then((data) => setRooms(data || []));
  }, []);

  const addRoom = () => {
    if (!roomName) return;
    const newRooms = [
      ...rooms,
      { id: Date.now(), name: roomName, meter: meter || 0 }
    ];
    setRooms(newRooms);
    localforage.setItem(ROOM_DB, newRooms);
    setRoomName("");
    setMeter("");
  };

  const deleteRoom = (id) => {
    const newRooms = rooms.filter((r) => r.id !== id);
    setRooms(newRooms);
    localforage.setItem(ROOM_DB, newRooms);
  };

  const setNewMeter = (id, newValue) => {
    const newRooms = rooms.map((room) =>
      room.id === id ? { ...room, meter: newValue } : room
    );
    setRooms(newRooms);
    localforage.setItem(ROOM_DB, newRooms);
  };

  return (
    <Box mb={3}>
      <Typography variant="h5">Rooms</Typography>
      <Box display="flex" gap={2} mt={1} alignItems="center">
        <TextField
          label="Room Name/No."
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <TextField
          label="Initial Meter Reading"
          type="number"
          value={meter}
          onChange={(e) => setMeter(e.target.value)}
        />
        <Button variant="contained" onClick={addRoom}>
          Add Room
        </Button>
      </Box>
      <List>
        {rooms.map((room) => (
          <ListItem key={room.id} secondaryAction={
            <IconButton edge="end" onClick={() => deleteRoom(room.id)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText
              primary={`${room.name}`}
              secondary={
                <Box display="flex" alignItems="center" gap={2}>
                  Meter:{" "}
                  <TextField
                    size="small"
                    type="number"
                    value={room.meter}
                    onChange={e =>
                      setNewMeter(room.id, Number(e.target.value))
                    }
                    style={{ width: 80 }}
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}