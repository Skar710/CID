"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Target, Network, AlertTriangle, Plus, Share2, MessageSquare, Pencil, Trash2, Search } from 'lucide-react';

interface IntelligenceReport {
  _id: string;
  title: string;
  type: string;
  content: string;
  source: string;
  reliability: string;
  classification: string;
  dateReceived: string;
  analyst: string;
  relatedCases: string[];
  status: string;
  tags: string[];
  lastUpdated: string;
}

export default function IntelligencePage() {
  const [reports, setReports] = useState<IntelligenceReport[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'strategic',
    content: '',
    source: '',
    reliability: 'confirmed',
    classification: 'confidential',
    analyst: '',
    relatedCases: '',
    tags: '',
    status: 'active'
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/intelligence', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to fetch intelligence reports. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const reportData = {
        ...newReport,
        relatedCases: newReport.relatedCases.split(',').map(c => c.trim()).filter(Boolean),
        tags: newReport.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const response = await fetch('http://localhost:5000/api/intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) throw new Error('Failed to add report');

      setShowAddForm(false);
      setNewReport({
        title: '',
        type: 'strategic',
        content: '',
        source: '',
        reliability: 'confirmed',
        classification: 'confidential',
        analyst: '',
        relatedCases: '',
        tags: '',
        status: 'active'
      });
      fetchReports();
    } catch (error) {
      console.error('Error adding report:', error);
      alert('Failed to add intelligence report. Please try again.');
    }
  };

  const handleUpdateReport = async (reportId: string, updatedData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/intelligence/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to update report');

      setEditingReport(null);
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update intelligence report. Please try again.');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this intelligence report? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/intelligence/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete report');

      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete intelligence report. Please try again.');
    }
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.title.toLowerCase().includes(searchLower) ||
      report.content.toLowerCase().includes(searchLower) ||
      report.source.toLowerCase().includes(searchLower) ||
      report.analyst.toLowerCase().includes(searchLower) ||
      report.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const groupedReports = filteredReports.reduce((acc, report) => {
    if (!acc[report.type]) {
      acc[report.type] = [];
    }
    acc[report.type].push(report);
    return acc;
  }, {} as Record<string, IntelligenceReport[]>);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Intelligence Reports</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 w-64"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Intelligence Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Report Title"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  required
                />
                <Select
                  value={newReport.type}
                  onValueChange={(value) => setNewReport({ ...newReport, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strategic">Strategic Intelligence</SelectItem>
                    <SelectItem value="tactical">Tactical Intelligence</SelectItem>
                    <SelectItem value="operational">Operational Intelligence</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Report Content"
                  value={newReport.content}
                  onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Source"
                    value={newReport.source}
                    onChange={(e) => setNewReport({ ...newReport, source: e.target.value })}
                    required
                  />
                  <Select
                    value={newReport.reliability}
                    onValueChange={(value) => setNewReport({ ...newReport, reliability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Source Reliability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="probable">Probable</SelectItem>
                      <SelectItem value="possible">Possible</SelectItem>
                      <SelectItem value="doubtful">Doubtful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Analyst Name"
                    value={newReport.analyst}
                    onChange={(e) => setNewReport({ ...newReport, analyst: e.target.value })}
                    required
                  />
                  <Select
                    value={newReport.classification}
                    onValueChange={(value) => setNewReport({ ...newReport, classification: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="secret">Secret</SelectItem>
                      <SelectItem value="top-secret">Top Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Related Cases (comma-separated)"
                  value={newReport.relatedCases}
                  onChange={(e) => setNewReport({ ...newReport, relatedCases: e.target.value })}
                />
                <Input
                  placeholder="Tags (comma-separated)"
                  value={newReport.tags}
                  onChange={(e) => setNewReport({ ...newReport, tags: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="submit">Submit Report</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Strategic Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedReports['strategic']?.map((report) => (
                  <div key={report._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(report.dateReceived).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-1 line-clamp-2">{report.content}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {report.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                          report.reliability === 'confirmed' ? 'bg-green-100 text-green-800' :
                          report.reliability === 'probable' ? 'bg-blue-100 text-blue-800' :
                          report.reliability === 'possible' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.reliability.charAt(0).toUpperCase() + report.reliability.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReport(report._id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReport(report._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {editingReport === report._id && (
                      <div className="mt-4 border-t pt-4">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const updatedData = {
                            title: formData.get('title'),
                            content: formData.get('content'),
                            reliability: formData.get('reliability'),
                            classification: formData.get('classification'),
                            status: formData.get('status')
                          };
                          handleUpdateReport(report._id, updatedData);
                        }}>
                          <div className="space-y-4">
                            <Input
                              name="title"
                              defaultValue={report.title}
                              required
                            />
                            <Textarea
                              name="content"
                              defaultValue={report.content}
                              required
                            />
                            <Select
                              name="reliability"
                              defaultValue={report.reliability}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Reliability" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="probable">Probable</SelectItem>
                                <SelectItem value="possible">Possible</SelectItem>
                                <SelectItem value="doubtful">Doubtful</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              name="classification"
                              defaultValue={report.classification}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Classification" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confidential">Confidential</SelectItem>
                                <SelectItem value="secret">Secret</SelectItem>
                                <SelectItem value="top-secret">Top Secret</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              name="status"
                              defaultValue={report.status}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                                <SelectItem value="pending-review">Pending Review</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Button type="submit">Save Changes</Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingReport(null)}
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
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tactical Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedReports['tactical']?.map((report) => (
                  <div key={report._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(report.dateReceived).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-1 line-clamp-2">{report.content}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {report.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                          report.reliability === 'confirmed' ? 'bg-green-100 text-green-800' :
                          report.reliability === 'probable' ? 'bg-blue-100 text-blue-800' :
                          report.reliability === 'possible' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.reliability.charAt(0).toUpperCase() + report.reliability.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReport(report._id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReport(report._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {editingReport === report._id && (
                      <div className="mt-4 border-t pt-4">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const updatedData = {
                            title: formData.get('title'),
                            content: formData.get('content'),
                            reliability: formData.get('reliability'),
                            classification: formData.get('classification'),
                            status: formData.get('status')
                          };
                          handleUpdateReport(report._id, updatedData);
                        }}>
                          <div className="space-y-4">
                            <Input
                              name="title"
                              defaultValue={report.title}
                              required
                            />
                            <Textarea
                              name="content"
                              defaultValue={report.content}
                              required
                            />
                            <Select
                              name="reliability"
                              defaultValue={report.reliability}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Reliability" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="probable">Probable</SelectItem>
                                <SelectItem value="possible">Possible</SelectItem>
                                <SelectItem value="doubtful">Doubtful</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              name="classification"
                              defaultValue={report.classification}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Classification" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confidential">Confidential</SelectItem>
                                <SelectItem value="secret">Secret</SelectItem>
                                <SelectItem value="top-secret">Top Secret</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              name="status"
                              defaultValue={report.status}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                                <SelectItem value="pending-review">Pending Review</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Button type="submit">Save Changes</Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingReport(null)}
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
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Operational Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedReports['operational']?.map((report) => (
                  <div key={report._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(report.dateReceived).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-1 line-clamp-2">{report.content}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {report.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                          report.reliability === 'confirmed' ? 'bg-green-100 text-green-800' :
                          report.reliability === 'probable' ? 'bg-blue-100 text-blue-800' :
                          report.reliability === 'possible' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.reliability.charAt(0).toUpperCase() + report.reliability.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReport(report._id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReport(report._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {editingReport === report._id && (
                      <div className="mt-4 border-t pt-4">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const updatedData = {
                            title: formData.get('title'),
                            content: formData.get('content'),
                            reliability: formData.get('reliability'),
                            classification: formData.get('classification'),
                            status: formData.get('status')
                          };
                          handleUpdateReport(report._id, updatedData);
                        }}>
                          <div className="space-y-4">
                            <Input
                              name="title"
                              defaultValue={report.title}
                              required
                            />
                            <Textarea
                              name="content"
                              defaultValue={report.content}
                              required
                            />
                            <Select
                              name="reliability"
                              defaultValue={report.reliability}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Reliability" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="probable">Probable</SelectItem>
                                <SelectItem value="possible">Possible</SelectItem>
                                <SelectItem value="doubtful">Doubtful</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              name="classification"
                              defaultValue={report.classification}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Classification" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confidential">Confidential</SelectItem>
                                <SelectItem value="secret">Secret</SelectItem>
                                <SelectItem value="top-secret">Top Secret</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              name="status"
                              defaultValue={report.status}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                                <SelectItem value="pending-review">Pending Review</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Button type="submit">Save Changes</Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingReport(null)}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}