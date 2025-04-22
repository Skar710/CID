"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Pencil, Trash2, Download } from 'lucide-react';

interface Crime {
  _id: string;
  type: string;
  date: string;
  description: string;
}

interface ForensicReport {
  _id: string;
  caseNumber: string;
  crimeId: string;
  reportDate: string;
  findings: string;
  evidence: string[];
  analyst: string;
  status: string;
}

export default function ForensicsPage() {
  const [reports, setReports] = useState<ForensicReport[]>([]);
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    caseNumber: '',
    crimeId: '',
    findings: '',
    evidence: '',
    analyst: '',
    status: ''
  });
  const [newReport, setNewReport] = useState({
    caseNumber: '',
    crimeId: '',
    findings: '',
    evidence: '',
    analyst: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchReports();
    fetchCrimes();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/forensics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

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

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/forensics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newReport,
          evidence: newReport.evidence.split(',').map(e => e.trim())
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewReport({
          caseNumber: '',
          crimeId: '',
          findings: '',
          evidence: '',
          analyst: '',
          status: 'pending'
        });
        fetchReports();
      }
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  const handleUpdateReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/forensics/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editFormData,
          evidence: editFormData.evidence.split(',').map(e => e.trim())
        })
      });

      if (response.ok) {
        setEditingReport(null);
        fetchReports();
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report. Please try again.');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this forensic report? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/forensics/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report. Please try again.');
    }
  };

  const startEditing = (report: ForensicReport) => {
    setEditingReport(report._id);
    setEditFormData({
      caseNumber: report.caseNumber,
      crimeId: report.crimeId,
      findings: report.findings,
      evidence: report.evidence.join(', '),
      analyst: report.analyst,
      status: report.status
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Forensic Reports</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Forensic Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Case Number"
                    value={newReport.caseNumber}
                    onChange={(e) => setNewReport({ ...newReport, caseNumber: e.target.value })}
                    required
                  />
                  <Select
                    value={newReport.crimeId}
                    onValueChange={(value) => setNewReport({ ...newReport, crimeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Crime" />
                    </SelectTrigger>
                    <SelectContent>
                      {crimes.map((crime) => (
                        <SelectItem key={crime._id} value={crime._id}>
                          {crime.type} - {new Date(crime.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Analyst Name"
                  value={newReport.analyst}
                  onChange={(e) => setNewReport({ ...newReport, analyst: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Findings"
                  value={newReport.findings}
                  onChange={(e) => setNewReport({ ...newReport, findings: e.target.value })}
                  required
                />
                <Input
                  placeholder="Evidence (comma-separated)"
                  value={newReport.evidence}
                  onChange={(e) => setNewReport({ ...newReport, evidence: e.target.value })}
                  required
                />
                <Select
                  value={newReport.status}
                  onValueChange={(value) => setNewReport({ ...newReport, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
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
          {reports.map((report) => (
            <Card key={report._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Case #{report.caseNumber}
                  </div>
                  <div className="flex gap-2">
                    {/* <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(report)}
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
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingReport === report._id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateReport(report._id);
                  }} className="space-y-4">
                    <Input
                      placeholder="Case Number"
                      value={editFormData.caseNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, caseNumber: e.target.value })}
                      required
                    />
                    <Select
                      value={editFormData.crimeId}
                      onValueChange={(value) => setEditFormData({ ...editFormData, crimeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Crime" />
                      </SelectTrigger>
                      <SelectContent>
                        {crimes.map((crime) => (
                          <SelectItem key={crime._id} value={crime._id}>
                            {crime.type} - {new Date(crime.date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Analyst Name"
                      value={editFormData.analyst}
                      onChange={(e) => setEditFormData({ ...editFormData, analyst: e.target.value })}
                      required
                    />
                    <Textarea
                      placeholder="Findings"
                      value={editFormData.findings}
                      onChange={(e) => setEditFormData({ ...editFormData, findings: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Evidence (comma-separated)"
                      value={editFormData.evidence}
                      onChange={(e) => setEditFormData({ ...editFormData, evidence: e.target.value })}
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
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
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Report Date</p>
                      <p>{new Date(report.reportDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Analyst</p>
                      <p>{report.analyst}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {report.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Findings</p>
                      <p className="text-sm line-clamp-3">{report.findings}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Evidence</p>
                      <div className="flex flex-wrap gap-2">
                        {report.evidence.map((item, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}