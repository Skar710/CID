"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search, Filter, UserX, FileText, Plus, Pencil, Trash2 } from 'lucide-react';

interface Criminal {
  _id: string;
  name: string;
  alias: string[];
  dateOfBirth: string;
  nationality: string;
  status: string;
  dangerLevel: 'low' | 'medium' | 'high';
  lastKnownLocation: string;
  associatedCrimes: string[];
  physicalDescription: {
    height: string;
    weight: string;
    distinguishingFeatures: string[];
  };
}

export default function CriminalsPage() {
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCriminal, setEditingCriminal] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    alias: '',
    dateOfBirth: '',
    nationality: '',
    status: '',
    dangerLevel: '',
    lastKnownLocation: '',
    associatedCrimes: '',
    height: '',
    weight: '',
    distinguishingFeatures: ''
  });
  const [newCriminal, setNewCriminal] = useState({
    name: '',
    alias: '',
    dateOfBirth: '',
    nationality: '',
    status: 'at-large',
    dangerLevel: 'low',
    lastKnownLocation: '',
    associatedCrimes: '',
    height: '',
    weight: '',
    distinguishingFeatures: ''
  });

  useEffect(() => {
    fetchCriminals();
  }, []);

  const fetchCriminals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/criminals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch criminals');
      const data = await response.json();
      setCriminals(data);
    } catch (error) {
      console.error('Error fetching criminals:', error);
      alert('Failed to fetch criminals. Please try again.');
    }
  };

  const handleAddCriminal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const criminalData = {
        name: newCriminal.name,
        alias: newCriminal.alias.split(',').map(a => a.trim()).filter(Boolean),
        dateOfBirth: newCriminal.dateOfBirth,
        nationality: newCriminal.nationality,
        status: newCriminal.status,
        dangerLevel: newCriminal.dangerLevel,
        lastKnownLocation: newCriminal.lastKnownLocation,
        associatedCrimes: newCriminal.associatedCrimes.split(',').map(c => c.trim()).filter(Boolean),
        physicalDescription: {
          height: newCriminal.height,
          weight: newCriminal.weight,
          distinguishingFeatures: newCriminal.distinguishingFeatures.split(',').map(f => f.trim()).filter(Boolean)
        }
      };

      const response = await fetch('http://localhost:5000/api/criminals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(criminalData)
      });

      if (!response.ok) throw new Error('Failed to add criminal');

      setShowAddForm(false);
      setNewCriminal({
        name: '',
        alias: '',
        dateOfBirth: '',
        nationality: '',
        status: 'at-large',
        dangerLevel: 'low',
        lastKnownLocation: '',
        associatedCrimes: '',
        height: '',
        weight: '',
        distinguishingFeatures: ''
      });
      fetchCriminals();
    } catch (error) {
      console.error('Error adding criminal:', error);
      alert('Failed to add criminal. Please try again.');
    }
  };

  const startEditing = (criminal: Criminal) => {
    setEditingCriminal(criminal._id);
    setEditFormData({
      name: criminal.name,
      alias: criminal.alias.join(', '),
      dateOfBirth: criminal.dateOfBirth,
      nationality: criminal.nationality,
      status: criminal.status,
      dangerLevel: criminal.dangerLevel,
      lastKnownLocation: criminal.lastKnownLocation,
      associatedCrimes: criminal.associatedCrimes.join(', '),
      height: criminal.physicalDescription.height,
      weight: criminal.physicalDescription.weight,
      distinguishingFeatures: criminal.physicalDescription.distinguishingFeatures.join(', ')
    });
  };

  const handleUpdateCriminal = async (criminalId: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedData = {
        name: editFormData.name,
        alias: editFormData.alias.split(',').map(a => a.trim()).filter(Boolean),
        dateOfBirth: editFormData.dateOfBirth,
        nationality: editFormData.nationality,
        status: editFormData.status,
        dangerLevel: editFormData.dangerLevel,
        lastKnownLocation: editFormData.lastKnownLocation,
        associatedCrimes: editFormData.associatedCrimes.split(',').map(c => c.trim()).filter(Boolean),
        physicalDescription: {
          height: editFormData.height,
          weight: editFormData.weight,
          distinguishingFeatures: editFormData.distinguishingFeatures.split(',').map(f => f.trim()).filter(Boolean)
        }
      };

      const response = await fetch(`http://localhost:5000/api/criminals/${criminalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to update criminal');

      setEditingCriminal(null);
      fetchCriminals();
    } catch (error) {
      console.error('Error updating criminal:', error);
      alert('Failed to update criminal. Please try again.');
    }
  };

  const handleDeleteCriminal = async (criminalId: string) => {
    if (!window.confirm('Are you sure you want to delete this criminal record? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/criminals/${criminalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete criminal');

      fetchCriminals();
    } catch (error) {
      console.error('Error deleting criminal:', error);
      alert('Failed to delete criminal. Please try again.');
    }
  };

  const filteredCriminals = criminals.filter(criminal => {
    const searchLower = searchTerm.toLowerCase();
    return (
      criminal.name.toLowerCase().includes(searchLower) ||
      criminal.alias.some(alias => alias.toLowerCase().includes(searchLower)) ||
      criminal.nationality.toLowerCase().includes(searchLower) ||
      criminal.lastKnownLocation.toLowerCase().includes(searchLower) ||
      criminal.associatedCrimes.some(crime => crime.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Criminal Database</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 w-64"
                placeholder="Search criminals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Criminal
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Criminal Record</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCriminal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={newCriminal.name}
                    onChange={(e) => setNewCriminal({ ...newCriminal, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Aliases (comma-separated)"
                    value={newCriminal.alias}
                    onChange={(e) => setNewCriminal({ ...newCriminal, alias: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    value={newCriminal.dateOfBirth}
                    onChange={(e) => setNewCriminal({ ...newCriminal, dateOfBirth: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Nationality"
                    value={newCriminal.nationality}
                    onChange={(e) => setNewCriminal({ ...newCriminal, nationality: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={newCriminal.status}
                    onValueChange={(value) => setNewCriminal({ ...newCriminal, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="at-large">At Large</SelectItem>
                      <SelectItem value="in-custody">In Custody</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={newCriminal.dangerLevel}
                    onValueChange={(value) => setNewCriminal({ ...newCriminal, dangerLevel: value as 'low' | 'medium' | 'high' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Danger Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Last Known Location"
                  value={newCriminal.lastKnownLocation}
                  onChange={(e) => setNewCriminal({ ...newCriminal, lastKnownLocation: e.target.value })}
                  required
                />
                <Input
                  placeholder="Associated Crimes (comma-separated)"
                  value={newCriminal.associatedCrimes}
                  onChange={(e) => setNewCriminal({ ...newCriminal, associatedCrimes: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Height"
                    value={newCriminal.height}
                    onChange={(e) => setNewCriminal({ ...newCriminal, height: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Weight"
                    value={newCriminal.weight}
                    onChange={(e) => setNewCriminal({ ...newCriminal, weight: e.target.value })}
                    required
                  />
                </div>
                <Input
                  placeholder="Distinguishing Features (comma-separated)"
                  value={newCriminal.distinguishingFeatures}
                  onChange={(e) => setNewCriminal({ ...newCriminal, distinguishingFeatures: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="submit">Add Criminal</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCriminals.map((criminal) => (
            <Card key={criminal._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserX className="h-5 w-5" />
                    {criminal.name}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(criminal)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCriminal(criminal._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editingCriminal === criminal._id ? (
                    <form onSubmit={(e) => handleUpdateCriminal(criminal._id, e)} className="space-y-4">
                      <Input
                        placeholder="Full Name"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Aliases (comma-separated)"
                        value={editFormData.alias}
                        onChange={(e) => setEditFormData({ ...editFormData, alias: e.target.value })}
                      />
                      <Input
                        type="date"
                        value={editFormData.dateOfBirth}
                        onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Nationality"
                        value={editFormData.nationality}
                        onChange={(e) => setEditFormData({ ...editFormData, nationality: e.target.value })}
                        required
                      />
                      <Select
                        value={editFormData.status}
                        onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="at-large">At Large</SelectItem>
                          <SelectItem value="in-custody">In Custody</SelectItem>
                          <SelectItem value="deceased">Deceased</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={editFormData.dangerLevel}
                        onValueChange={(value) => setEditFormData({ ...editFormData, dangerLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Danger Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Last Known Location"
                        value={editFormData.lastKnownLocation}
                        onChange={(e) => setEditFormData({ ...editFormData, lastKnownLocation: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Associated Crimes (comma-separated)"
                        value={editFormData.associatedCrimes}
                        onChange={(e) => setEditFormData({ ...editFormData, associatedCrimes: e.target.value })}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Height"
                          value={editFormData.height}
                          onChange={(e) => setEditFormData({ ...editFormData, height: e.target.value })}
                          required
                        />
                        <Input
                          placeholder="Weight"
                          value={editFormData.weight}
                          onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                          required
                        />
                      </div>
                      <Input
                        placeholder="Distinguishing Features (comma-separated)"
                        value={editFormData.distinguishingFeatures}
                        onChange={(e) => setEditFormData({ ...editFormData, distinguishingFeatures: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button type="submit">Save Changes</Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingCriminal(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Aliases</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {criminal.alias.map((alias, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                              {alias}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          criminal.status === 'in-custody' ? 'bg-green-100 text-green-800' :
                          criminal.status === 'at-large' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {criminal.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Danger Level</p>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          criminal.dangerLevel === 'high' ? 'bg-red-100 text-red-800' :
                          criminal.dangerLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {criminal.dangerLevel.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Known Location</p>
                        <p>{criminal.lastKnownLocation}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Associated Crimes</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {criminal.associatedCrimes.map((crime, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              {crime}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}