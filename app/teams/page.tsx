"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Phone, Mail, MapPin } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  specialization: string;
  contact: {
    email: string;
    phone: string;
  };
  location: string;
  status: string;
}

interface Team {
  _id: string;
  name: string;
  leader: string;
  members: TeamMember[];
  activeCases: number;
  department: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    leader: '',
    department: '',
    activeCases: 0,
    members: [] as TeamMember[]
  });
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    specialization: '',
    contact: {
      email: '',
      phone: ''
    },
    location: '',
    status: 'active'
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleAddMember = () => {
    setNewTeam({
      ...newTeam,
      members: [...newTeam.members, newMember]
    });
    setNewMember({
      name: '',
      role: '',
      specialization: '',
      contact: {
        email: '',
        phone: ''
      },
      location: '',
      status: 'active'
    });
  };

  const handleSubmitTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTeam)
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewTeam({
          name: '',
          leader: '',
          department: '',
          activeCases: 0,
          members: []
        });
        fetchTeams();
      }
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Investigation Teams</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team
          </Button>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Team</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTeam} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Team Name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Team Leader"
                    value={newTeam.leader}
                    onChange={(e) => setNewTeam({ ...newTeam, leader: e.target.value })}
                    required
                  />
                </div>
                <Input
                  placeholder="Department"
                  value={newTeam.department}
                  onChange={(e) => setNewTeam({ ...newTeam, department: e.target.value })}
                  required
                />

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Member Name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      />
                      <Input
                        placeholder="Role"
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      />
                    </div>
                    <Input
                      placeholder="Specialization"
                      value={newMember.specialization}
                      onChange={(e) => setNewMember({ ...newMember, specialization: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newMember.contact.email}
                        onChange={(e) => setNewMember({
                          ...newMember,
                          contact: { ...newMember.contact, email: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="Phone"
                        value={newMember.contact.phone}
                        onChange={(e) => setNewMember({
                          ...newMember,
                          contact: { ...newMember.contact, phone: e.target.value }
                        })}
                      />
                    </div>
                    <Input
                      placeholder="Location"
                      value={newMember.location}
                      onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                    />
                    <Button type="button" onClick={handleAddMember}>
                      Add Member
                    </Button>
                  </div>
                </div>

                {newTeam.members.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                    <div className="space-y-2">
                      {newTeam.members.map((member, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">Create Team</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <Card key={team._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {team.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Team Leader</p>
                    <p className="font-semibold">{team.leader}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p>{team.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Cases</p>
                    <p className="text-lg font-bold text-blue-600">{team.activeCases}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Team Members</p>
                    <div className="space-y-2">
                      {team.members.map((member, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {member.location}
                          </div>
                        </div>
                      ))}
                    </div>
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