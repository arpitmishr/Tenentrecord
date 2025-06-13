import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService';
import { Tenant, Room, ElectricityReading, AdditionalService } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input, Select, TextArea } from '../components/Input';
import { Card } from '../components/Card';
import { formatDate, formatCurrency, formatMonthYear, getCurrentMonthYear } from '../utils/formatter';
import { PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon, BoltIcon, WrenchScrewdriverIcon, CheckCircleIcon, XCircleIcon, CurrencyDollarIcon, UsersIcon } from '../components/Icons';

// Sub-components for forms (defined outside TenantsPage to avoid re-creation on render)
interface TenantFormProps {
  onSubmit: (tenant: Tenant) => void;
  onClose: () => void;
  initialData?: Tenant | null;
  rooms: Room[];
}

const TenantForm: React.FC<TenantFormProps> = ({ onSubmit, onClose, initialData, rooms }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [contact, setContact] = useState(initialData?.contact || '');
  const [moveInDate, setMoveInDate] = useState(initialData?.moveInDate || new Date().toISOString().split('T')[0]);
  const [isVerified, setIsVerified] = useState(initialData?.isVerified || false);
  const [roomId, setRoomId] = useState<string | null>(initialData?.roomId || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !moveInDate) {
      alert("Name and Move-in Date are required.");
      return;
    }
    onSubmit({
      id: initialData?.id || crypto.randomUUID(),
      name,
      contact,
      moveInDate,
      isVerified,
      roomId,
    });
  };

  const availableRooms = rooms.filter(room => !room.currentTenantId || room.id === initialData?.roomId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Contact (Phone/Email)" value={contact} onChange={(e) => setContact(e.target.value)} />
      <Input label="Move-in Date" type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} required />
      <Select label="Assign Room" value={roomId || ''} onChange={(e) => setRoomId(e.target.value || null)}>
        <option value="">No Room Assigned</option>
        {availableRooms.map(room => (
          <option key={room.id} value={room.id}>{room.roomNumber} ({formatCurrency(room.rentRate)})</option>
        ))}
      </Select>
      <div className="flex items-center">
        <input type="checkbox" id="isVerified" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="h-4 w-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500" />
        <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-300">Verification Done</label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">{initialData ? 'Update' : 'Add'} Tenant</Button>
      </div>
    </form>
  );
};

interface ElectricityReadingFormProps {
  onSubmit: (reading: Omit<ElectricityReading, 'id' | 'unitsConsumed' | 'totalCharge'>) => void;
  onClose: () => void;
  tenantId: string;
  roomId: string;
  lastReading?: ElectricityReading | null;
}

const ElectricityReadingForm: React.FC<ElectricityReadingFormProps> = ({ onSubmit, onClose, tenantId, roomId, lastReading }) => {
    const [date, setDate] = useState(getCurrentMonthYear());
    const [previousUnit, setPreviousUnit] = useState(lastReading?.currentUnit || 0);
    const [currentUnit, setCurrentUnit] = useState(0);
    const [ratePerUnit, setRatePerUnit] = useState(0.15); // Example rate, make this configurable
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        if (lastReading) {
            setPreviousUnit(lastReading.currentUnit);
        }
    }, [lastReading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUnit < previousUnit) {
            alert("Current unit reading cannot be less than previous unit reading.");
            return;
        }
        onSubmit({ tenantId, roomId, date, previousUnit, currentUnit, ratePerUnit, isPaid });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Month (YYYY-MM)" type="month" value={date} onChange={e => setDate(e.target.value)} required />
            <Input label="Previous Unit Reading" type="number" value={previousUnit} onChange={e => setPreviousUnit(parseFloat(e.target.value))} required min="0" />
            <Input label="Current Unit Reading" type="number" value={currentUnit} onChange={e => setCurrentUnit(parseFloat(e.target.value))} required min={previousUnit.toString()} />
            <Input label="Rate Per Unit" type="number" value={ratePerUnit} onChange={e => setRatePerUnit(parseFloat(e.target.value))} required step="0.01" min="0" />
            <div className="flex items-center">
                <input type="checkbox" id="isElecPaid" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="h-4 w-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500" />
                <label htmlFor="isElecPaid" className="ml-2 block text-sm text-gray-300">Paid</label>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">Add Reading</Button>
            </div>
        </form>
    );
};

interface AdditionalServiceFormProps {
  onSubmit: (service: Omit<AdditionalService, 'id'>) => void;
  onClose: () => void;
  tenantId: string;
}

const AdditionalServiceForm: React.FC<AdditionalServiceFormProps> = ({ onSubmit, onClose, tenantId }) => {
    const [description, setDescription] = useState('');
    const [charge, setCharge] = useState(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isPaid, setIsPaid] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!description || charge <= 0){
            alert("Description and valid charge are required.");
            return;
        }
        onSubmit({ tenantId, description, charge, date, isPaid });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <TextArea label="Service Description" value={description} onChange={e => setDescription(e.target.value)} required />
            <Input label="Charge Amount" type="number" value={charge} onChange={e => setCharge(parseFloat(e.target.value))} required min="0.01" step="0.01" />
            <Input label="Service Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
             <div className="flex items-center">
                <input type="checkbox" id="isServicePaid" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="h-4 w-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500" />
                <label htmlFor="isServicePaid" className="ml-2 block text-sm text-gray-300">Paid</label>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">Add Service</Button>
            </div>
        </form>
    );
};


// Main TenantsPage component
export const TenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const [managingTenant, setManagingTenant] = useState<Tenant | null>(null);
  const [electricityReadings, setElectricityReadings] = useState<ElectricityReading[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [isElectricityModalOpen, setIsElectricityModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const fetchTenantsAndRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const tenantsData = await dbService.getAllTenants();
      const roomsData = await dbService.getAllRooms();
      // Augment rooms with currentTenantId for easier lookup
      const augmentedRooms = roomsData.map(room => {
        const tenantInRoom = tenantsData.find(t => t.roomId === room.id);
        return { ...room, currentTenantId: tenantInRoom?.id || null };
      });
      setTenants(tenantsData.sort((a,b) => a.name.localeCompare(b.name)));
      setRooms(augmentedRooms);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Error fetching data. Check console.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenantsAndRooms();
  }, [fetchTenantsAndRooms]);

  const handleAddOrUpdateTenant = async (tenant: Tenant) => {
    try {
      if (editingTenant) {
        await dbService.updateTenant(tenant);
      } else {
        await dbService.addTenant(tenant);
      }
      // Update room assignment
      if(tenant.roomId){
        const room = rooms.find(r => r.id === tenant.roomId);
        if(room) await dbService.updateRoom({...room, currentTenantId: tenant.id});
      }
      // If previous room existed, unassign it
      if(editingTenant && editingTenant.roomId && editingTenant.roomId !== tenant.roomId){
         const prevRoom = rooms.find(r => r.id === editingTenant.roomId);
         if(prevRoom) await dbService.updateRoom({...prevRoom, currentTenantId: null});
      }

      fetchTenantsAndRooms();
      setIsModalOpen(false);
      setEditingTenant(null);
    } catch (error) {
      console.error("Failed to save tenant:", error);
      alert("Error saving tenant. Check console.");
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this tenant and all their records? This cannot be undone.")) {
      try {
        const tenantToDelete = tenants.find(t => t.id === id);
        await dbService.deleteTenant(id);
         if(tenantToDelete && tenantToDelete.roomId){
            const room = rooms.find(r => r.id === tenantToDelete.roomId);
            if(room) await dbService.updateRoom({...room, currentTenantId: null});
         }
        fetchTenantsAndRooms();
      } catch (error) {
        console.error("Failed to delete tenant:", error);
        alert("Error deleting tenant. Check console.");
      }
    }
  };

  const openAddModal = () => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };
  
  const openManageTenantModal = async (tenant: Tenant) => {
    setManagingTenant(tenant);
    try {
        const [elecData, servicesData] = await Promise.all([
            dbService.getElectricityReadingsForTenant(tenant.id),
            dbService.getAdditionalServicesForTenant(tenant.id)
        ]);
        setElectricityReadings(elecData.sort((a,b) => b.date.localeCompare(a.date)));
        setAdditionalServices(servicesData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
        console.error("Error fetching tenant details:", error);
        alert("Error fetching tenant details.");
    }
  };

  const closeManageTenantModal = () => {
    setManagingTenant(null);
    setElectricityReadings([]);
    setAdditionalServices([]);
  };

  const handleAddElectricityReading = async (readingData: Omit<ElectricityReading, 'id' | 'unitsConsumed' | 'totalCharge'>) => {
    if (!managingTenant) return;
    const unitsConsumed = readingData.currentUnit - readingData.previousUnit;
    const totalCharge = unitsConsumed * readingData.ratePerUnit;
    const newReading: ElectricityReading = {
        ...readingData,
        id: crypto.randomUUID(),
        unitsConsumed,
        totalCharge,
    };
    try {
        await dbService.addElectricityReading(newReading);
        const updatedReadings = await dbService.getElectricityReadingsForTenant(managingTenant.id);
        setElectricityReadings(updatedReadings.sort((a,b) => b.date.localeCompare(a.date)));
        setIsElectricityModalOpen(false);
    } catch (error) {
        console.error("Error adding electricity reading:", error);
        alert("Error adding electricity reading.");
    }
  };

  const handleAddAdditionalService = async (serviceData: Omit<AdditionalService, 'id'>) => {
    if (!managingTenant) return;
    const newService: AdditionalService = { ...serviceData, id: crypto.randomUUID() };
    try {
        await dbService.addAdditionalService(newService);
        const updatedServices = await dbService.getAdditionalServicesForTenant(managingTenant.id);
        setAdditionalServices(updatedServices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsServiceModalOpen(false);
    } catch (error) {
        console.error("Error adding additional service:", error);
        alert("Error adding additional service.");
    }
  };
  
  const togglePaymentStatus = async (type: 'electricity' | 'service', id: string, currentStatus: boolean) => {
    if (!managingTenant) return;
    try {
        if (type === 'electricity') {
            const reading = electricityReadings.find(r => r.id === id);
            if (reading) {
                await dbService.updateElectricityReading({ ...reading, isPaid: !currentStatus });
            }
        } else {
            const service = additionalServices.find(s => s.id === id);
            if (service) {
                await dbService.updateAdditionalService({ ...service, isPaid: !currentStatus });
            }
        }
        // Refresh data in modal
        const [elecData, servicesData] = await Promise.all([
            dbService.getElectricityReadingsForTenant(managingTenant.id),
            dbService.getAdditionalServicesForTenant(managingTenant.id)
        ]);
        setElectricityReadings(elecData.sort((a,b) => b.date.localeCompare(a.date)));
        setAdditionalServices(servicesData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    } catch (error) {
        console.error(`Error updating ${type} payment status:`, error);
        alert(`Error updating ${type} payment status.`);
    }
  };

  const getLastElectricityReading = (): ElectricityReading | null => {
    if (electricityReadings.length > 0) {
        // Readings are sorted by date descending, so the first one is the latest
        return electricityReadings[0];
    }
    return null;
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-100">Tenants ({tenants.length})</h2>
        <Button onClick={openAddModal} variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
          Add Tenant
        </Button>
      </div>

      {tenants.length === 0 ? (
         <Card className="text-center">
          <UsersIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
          <p className="text-xl text-gray-400">No tenants found.</p>
          <p className="text-gray-500">Click "Add Tenant" to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map(tenant => {
            const room = rooms.find(r => r.id === tenant.roomId);
            return (
              <Card key={tenant.id} title={tenant.name} className="flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-400">Contact: <span className="text-gray-200">{tenant.contact || 'N/A'}</span></p>
                  <p className="text-sm text-gray-400">Move-in: <span className="text-gray-200">{formatDate(tenant.moveInDate)}</span></p>
                  <p className="text-sm text-gray-400">Room: <span className="text-gray-200">{room ? `${room.roomNumber} (${formatCurrency(room.rentRate)})` : 'Not Assigned'}</span></p>
                  <p className="text-sm text-gray-400 flex items-center">Verification: {tenant.isVerified 
                    ? <CheckCircleIcon className="w-5 h-5 text-green-400 ml-2" /> 
                    : <XCircleIcon className="w-5 h-5 text-red-400 ml-2" />}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => openManageTenantModal(tenant)} title="Manage Tenant Records">
                    <EyeIcon className="w-5 h-5" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(tenant)} title="Edit Tenant">
                    <PencilIcon className="w-5 h-5" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteTenant(tenant.id)} title="Delete Tenant">
                    <TrashIcon className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTenant(null); }} title={editingTenant ? 'Edit Tenant' : 'Add New Tenant'}>
        <TenantForm 
          onSubmit={handleAddOrUpdateTenant} 
          onClose={() => { setIsModalOpen(false); setEditingTenant(null); }} 
          initialData={editingTenant}
          rooms={rooms}
        />
      </Modal>

      {managingTenant && (
        <Modal isOpen={!!managingTenant} onClose={closeManageTenantModal} title={`Manage: ${managingTenant.name}`} size="xl">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Electricity Readings Section */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold text-sky-400 flex items-center"><BoltIcon className="w-6 h-6 mr-2"/>Electricity Readings</h3>
                        <Button size="sm" onClick={() => setIsElectricityModalOpen(true)} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Add Reading</Button>
                    </div>
                    {electricityReadings.length === 0 ? <p className="text-gray-400 text-sm">No electricity readings recorded.</p> : (
                        <ul className="space-y-2">
                            {electricityReadings.map(r => (
                                <li key={r.id} className="p-3 bg-slate-700 rounded-md text-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p><span className="font-semibold">{formatMonthYear(r.date)}</span>: {r.unitsConsumed} units ({formatCurrency(r.totalCharge)})</p>
                                            <p className="text-xs text-gray-400">Prev: {r.previousUnit}, Curr: {r.currentUnit}, Rate: {formatCurrency(r.ratePerUnit)}/unit</p>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant={r.isPaid ? "ghost" : "primary"} 
                                            onClick={() => togglePaymentStatus('electricity', r.id, r.isPaid)}
                                            leftIcon={r.isPaid ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <CurrencyDollarIcon className="w-4 h-4"/>}
                                            className={r.isPaid ? "text-green-400" : ""}
                                        >
                                            {r.isPaid ? 'Paid' : 'Mark Paid'}
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Additional Services Section */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold text-sky-400 flex items-center"><WrenchScrewdriverIcon className="w-6 h-6 mr-2"/>Additional Services</h3>
                        <Button size="sm" onClick={() => setIsServiceModalOpen(true)} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Add Service</Button>
                    </div>
                    {additionalServices.length === 0 ? <p className="text-gray-400 text-sm">No additional services recorded.</p> : (
                        <ul className="space-y-2">
                            {additionalServices.map(s => (
                                <li key={s.id} className="p-3 bg-slate-700 rounded-md text-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p><span className="font-semibold">{s.description}</span> on {formatDate(s.date)}: {formatCurrency(s.charge)}</p>
                                        </div>
                                         <Button 
                                            size="sm" 
                                            variant={s.isPaid ? "ghost" : "primary"} 
                                            onClick={() => togglePaymentStatus('service', s.id, s.isPaid)}
                                            leftIcon={s.isPaid ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <CurrencyDollarIcon className="w-4 h-4"/>}
                                            className={s.isPaid ? "text-green-400" : ""}
                                        >
                                            {s.isPaid ? 'Paid' : 'Mark Paid'}
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </Modal>
      )}

      {managingTenant && (
          <>
            <Modal isOpen={isElectricityModalOpen} onClose={() => setIsElectricityModalOpen(false)} title="Add Electricity Reading">
                <ElectricityReadingForm 
                    onSubmit={handleAddElectricityReading} 
                    onClose={() => setIsElectricityModalOpen(false)}
                    tenantId={managingTenant.id}
                    roomId={managingTenant.roomId || ''} // A tenant must have a room for electricity reading ideally. Handle if not.
                    lastReading={getLastElectricityReading()}
                />
            </Modal>
            <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title="Add Additional Service">
                <AdditionalServiceForm
                    onSubmit={handleAddAdditionalService}
                    onClose={() => setIsServiceModalOpen(false)}
                    tenantId={managingTenant.id}
                />
            </Modal>
          </>
      )}

    </div>
  );
};
