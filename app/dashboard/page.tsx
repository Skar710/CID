"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertCircle, BarChart2, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
});

interface Crime {
  _id: string;
  type: string;
  location: {
    coordinates: [number, number];
  };
  date: string;
  description: string;
  status: string;
}

export default function Dashboard() {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrime, setEditingCrime] = useState<string | null>(null);
  const [newCrime, setNewCrime] = useState({
    type: '',
    latitude: '',
    longitude: '',
    description: '',
    date: '',
    status: 'reported'
  });

  useEffect(() => {
    fetchCrimes();
  }, []);

  const fetchCrimes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/crimes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCrimes(data);
    } catch (error) {
      console.error('Error fetching crimes:', error);
    }
  };

  const handleAddCrime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/crimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: newCrime.type,
          location: {
            type: 'Point',
            coordinates: [parseFloat(newCrime.longitude), parseFloat(newCrime.latitude)]
          },
          date: new Date(newCrime.date),
          description: newCrime.description,
          status: newCrime.status
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewCrime({
          type: '',
          latitude: '',
          longitude: '',
          description: '',
          date: '',
          status: 'reported'
        });
        fetchCrimes();
      }
    } catch (error) {
      console.error('Error adding crime:', error);
    }
  };

  const handleUpdateCrime = async (crimeId: string, updatedData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/crimes/${crimeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        setEditingCrime(null);
        fetchCrimes();
      }
    } catch (error) {
      console.error('Error updating crime:', error);
    }
  };

  const handleDeleteCrime = async (crimeId: string) => {
    if (window.confirm('Are you sure you want to delete this crime record?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/crimes/${crimeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchCrimes();
        }
      } catch (error) {
        console.error('Error deleting crime:', error);
      }
    }
  };

  const crimesByType = crimes.reduce((acc: any, crime) => {
    acc[crime.type] = (acc[crime.type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(crimesByType).map(([type, count]) => ({
    type,
    count
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Crime Dashboard</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Crime
          </Button>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Crime</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCrime} className="space-y-4">
                <Input
                  placeholder="Crime Type"
                  value={newCrime.type}
                  onChange={(e) => setNewCrime({ ...newCrime, type: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Latitude"
                    value={newCrime.latitude}
                    onChange={(e) => setNewCrime({ ...newCrime, latitude: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Longitude"
                    value={newCrime.longitude}
                    onChange={(e) => setNewCrime({ ...newCrime, longitude: e.target.value })}
                    required
                  />
                </div>
                <Input
                  type="datetime-local"
                  value={newCrime.date}
                  onChange={(e) => setNewCrime({ ...newCrime, date: e.target.value })}
                  required
                />
                <Input
                  placeholder="Description"
                  value={newCrime.description}
                  onChange={(e) => setNewCrime({ ...newCrime, description: e.target.value })}
                  required
                />
                <Select
                  value={newCrime.status}
                  onValueChange={(value) => setNewCrime({ ...newCrime, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit">Submit</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Crime Map
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Map crimes={crimes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Crime Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={500} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Crimes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crimes.map((crime) => (
                <Card key={crime._id}>
                  <CardContent className="pt-6">
                    {editingCrime === crime._id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const updatedData = {
                            type: formData.get('type'),
                            description: formData.get('description'),
                            status: formData.get('status')
                          };
                          handleUpdateCrime(crime._id, updatedData);
                        }}
                        className="space-y-4"
                      >
                        <Input
                          name="type"
                          defaultValue={crime.type}
                          required
                        />
                        <Input
                          name="description"
                          defaultValue={crime.description}
                          required
                        />
                        <Select
                          name="status"
                          defaultValue={crime.status}
                          onValueChange={(value) => {
                            const select = document.querySelector(`form[data-crime-id="${crime._id}"] select[name="status"]`);
                            if (select) {
                              (select as HTMLSelectElement).value = value;
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reported">Reported</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="solved">Solved</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">Save</Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCrime(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold">{crime.type}</h3>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingCrime(crime._id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCrime(crime._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(crime.date).toLocaleDateString()}
                        </p>
                        <p className="mt-2">{crime.description}</p>
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {crime.status}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}