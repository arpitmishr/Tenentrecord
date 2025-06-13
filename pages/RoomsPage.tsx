
import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService';
import { Room, Tenant } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatter';
import { PlusCircleIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '../components/Icons';

interface RoomFormProps {
  onSubmit: (room: Room) => void;
  onClose: () => void;
  initialData?: Room | null;
}

const RoomForm: React.FC<RoomFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [roomNumber, setRoomNumber] = useState(initialData?.roomNumber || '');
  const [rentRate, setRentRate] = useState(initialData?.rentRate || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || rentRate <= 0) {
        alert("Room number and a valid rent rate are required.");
        return;
    }
    onSubmit({
      id: initialData?.id || crypto.randomUUID(),
      roomNumber,
      rentRate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Room Number/Name" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
      <Input label="Rent Rate (per month)" type="number" value={rentRate} onChange={(e) => setRentRate(parseFloat(e.target.value))} required min="0.01" step="0.01" />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">{initialData ? 'Update' : 'Add'} Room</Button>
      </div>
    </form>
  );
};


export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const fetchRoomsAndTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const roomsData = await dbService.getAllRooms();
      const tenantsData = await dbService.getAllTenants();
      setRooms(roomsData.sort((a,b) => a.roomNumber.localeCompare(b.roomNumber)));
      setTenants(tenantsData);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      alert("Error fetching rooms. Check console.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomsAndTenants();
  }, [fetchRoomsAndTenants]);

  const handleAddOrUpdateRoom = async (room: Room) => {
    try {
      if (editingRoom) {
        await dbService.updateRoom(room);
      } else {
        await dbService.addRoom(room);
      }
      fetchRoomsAndTenants();
      setIsModalOpen(false);
      setEditingRoom(null);
    } catch (error) {
      console.error("Failed to save room:", error);
      alert("Error saving room. Check console.");
    }
  };

  const handleDeleteRoom = async (id: string) => {
    const roomToDelete = rooms.find(r => r.id === id);
    const tenantInRoom = tenants.find(t => t.roomId === id);

    if (tenantInRoom) {
      if (!window.confirm(`This room is occupied by ${tenantInRoom.name}. Deleting the room will unassign the tenant. Do you want to continue?`)) {
        return;
      }
    } else {
        if (!window.confirm("Are you sure you want to delete this room?")) {
            return;
        }
    }
    
    try {
      await dbService.deleteRoom(id); // dbService handles unassigning tenant
      fetchRoomsAndTenants();
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Error deleting room. Check console.");
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-100">Rooms ({rooms.length})</h2>
        <Button onClick={openAddModal} variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
          Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <Card className="text-center">
          <BuildingOfficeIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
          <p className="text-xl text-gray-400">No rooms found.</p>
          <p className="text-gray-500">Click "Add Room" to create your first room.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map(room => {
            const tenant = tenants.find(t => t.roomId === room.id);
            return (
              <Card key={room.id} title={`Room ${room.roomNumber}`} className="flex flex-col justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-100">{formatCurrency(room.rentRate)}<span className="text-sm text-gray-400">/month</span></p>
                  {tenant ? (
                    <p className="text-sm text-amber-400 mt-1">Occupied by: {tenant.name}</p>
                  ) : (
                    <p className="text-sm text-green-400 mt-1">Vacant</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(room)} title="Edit Room">
                    <PencilIcon className="w-5 h-5" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteRoom(room.id)} title="Delete Room">
                    <TrashIcon className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingRoom(null); }} title={editingRoom ? 'Edit Room' : 'Add New Room'}>
        <RoomForm onSubmit={handleAddOrUpdateRoom} onClose={() => { setIsModalOpen(false); setEditingRoom(null); }} initialData={editingRoom} />
      </Modal>
    </div>
  );
};
