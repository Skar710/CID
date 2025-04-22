"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileBox, Camera, Fingerprint, Database, Plus, Download, Eye, Pencil, Trash2 } from 'lucide-react';

interface Evidence {
  _id: string;
  caseNumber: string;
  type: string;
  description: string;
  location: string;
  collectedBy: string;
  collectionDate: string;
  status: string;
  analysisResults: string;
  chainOfCustody: {
    handler: string;
    action: string;
    timestamp: string;
  }[];
}

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEvidence, setNewEvidence] = useState({
    caseNumber: '',
    type: 'physical',
    description: '',
    location: '',
    collectedBy: '',
    collectionDate: '',
    status: 'processing',
    analysisResults: '',
  });

  const evidenceTypes = [
    { value: 'physical', label: 'Physical Evidence', icon: FileBox },
    { value: 'digital', label: 'Digital Evidence', icon: Database },
    { value: 'biological', label: 'Biological Evidence', icon: Fingerprint },
    { value: 'photographic', label: 'Photographic Evidence', icon: Camera },
  ];

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/evidence', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch evidence');
      const data = await response.json();
      setEvidence(data);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      alert('Failed to fetch evidence. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEvidence)
      });

      if (!response.ok) throw new Error('Failed to add evidence');

      setShowAddForm(false);
      setNewEvidence({
        caseNumber: '',
        type: 'physical',
        description: '',
        location: '',
        collectedBy: '',
        collectionDate: '',
        status: 'processing',
        analysisResults: '',
      });
      fetchEvidence();
    } catch (error) {
      console.error('Error adding evidence:', error);
      alert('Failed to add evidence. Please try again.');
    }
  };

  const handleUpdateEvidence = async (evidenceId: string, updatedData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/evidence/${evidenceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to update evidence');

      setEditingEvidence(null);
      fetchEvidence();
    } catch (error) {
      console.error('Error updating evidence:', error);
      alert('Failed to update evidence. Please try again.');
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!window.confirm('Are you sure you want to delete this evidence? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/evidence/${evidenceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete evidence');

      fetchEvidence();
    } catch (error) {
      console.error('Error deleting evidence:', error);
      alert('Failed to delete evidence. Please try again.');
    }
  };

  const filteredEvidence = evidence.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.caseNumber.toLowerCase().includes(searchLower) ||
      item.type.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower) ||
      item.collectedBy.toLowerCase().includes(searchLower)
    );
  });

  const groupedEvidence = filteredEvidence.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, Evidence[]>);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Evidence Analysis</h1>
          <div className="flex gap-4">
            <Input
              className="w-64"
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Evidence
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Case Number"
                    value={newEvidence.caseNumber}
                    onChange={(e) => setNewEvidence({ ...newEvidence, caseNumber: e.target.value })}
                    required
                  />
                  <Select
                    value={newEvidence.type}
                    onValueChange={(value) => setNewEvidence({ ...newEvidence, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Evidence Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {evidenceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <type.icon className="mr-2 h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Evidence Description"
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Collection Location"
                    value={newEvidence.location}
                    onChange={(e) => setNewEvidence({ ...newEvidence, location: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Collected By"
                    value={newEvidence.collectedBy}
                    onChange={(e) => setNewEvidence({ ...newEvidence, collectedBy: e.target.value })}
                    required
                  />
                </div>
                <Input
                  type="datetime-local"
                  value={newEvidence.collectionDate}
                  onChange={(e) => setNewEvidence({ ...newEvidence, collectionDate: e.target.value })}
                  required
                />
                <Select
                  value={newEvidence.status}
                  onValueChange={(value) => setNewEvidence({ ...newEvidence, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="analyzed">Analyzed</SelectItem>
                    <SelectItem value="stored">Stored</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Analysis Results"
                  value={newEvidence.analysisResults}
                  onChange={(e) => setNewEvidence({ ...newEvidence, analysisResults: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="submit">Submit</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidenceTypes.map((type) => (
            <Card key={type.value} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <type.icon className="h-5 w-5" />
                  {type.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Evidence Items</p>
                  <div className="space-y-2">
                    {groupedEvidence[type.value]?.map((item) => (
                      <div key={item._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Case #{item.caseNumber}</p>
                            <p className="text-sm text-gray-500">
                              Collected: {new Date(item.collectionDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-1">{item.description}</p>
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                              item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              item.status === 'analyzed' ? 'bg-green-100 text-green-800' :
                              item.status === 'stored' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingEvidence(item._id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvidence(item._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        {editingEvidence === item._id && (
                          <div className="mt-4 border-t pt-4">
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              const updatedData = {
                                status: formData.get('status'),
                                analysisResults: formData.get('analysisResults'),
                                handler: formData.get('handler'),
                                action: 'updated'
                              };
                              handleUpdateEvidence(item._id, updatedData);
                            }}>
                              <div className="space-y-4">
                                <Select
                                  name="status"
                                  defaultValue={item.status}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="analyzed">Analyzed</SelectItem>
                                    <SelectItem value="stored">Stored</SelectItem>
                                    <SelectItem value="disposed">Disposed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Textarea
                                  name="analysisResults"
                                  placeholder="Analysis Results"
                                  defaultValue={item.analysisResults}
                                />
                                <Input
                                  name="handler"
                                  placeholder="Handler Name"
                                  required
                                />
                                <div className="flex gap-2">
                                  <Button type="submit">Save Changes</Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingEvidence(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}