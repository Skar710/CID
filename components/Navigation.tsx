"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  BarChart2, 
  FileText, 
  Users, 
  UserX,
  LogOut,
  FileBox,
  Brain,
  GraduationCap
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-4">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <h2 className="text-lg font-semibold">Crime Dashboard</h2>
        </div>
        
        <nav className="space-y-2">
          <Button
            variant={isActive('/dashboard') ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard">
              <BarChart2 className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          <Button
            variant={isActive('/forensics') ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/forensics">
              <FileText className="mr-2 h-4 w-4" />
              Forensics
            </Link>
          </Button>

          <Button
            variant={isActive('/teams') ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/teams">
              <Users className="mr-2 h-4 w-4" />
              Teams
            </Link>
          </Button>

          <Button
            variant={isActive('/criminals') ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/criminals">
              <UserX className="mr-2 h-4 w-4" />
              Criminals
            </Link>
          </Button>

          <Button
            variant={isActive('/evidence') ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/evidence">
              <FileBox className="mr-2 h-4 w-4" />
              Evidence
            </Link>
          </Button>

          <Button
            variant={isActive('/intelligence') ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/intelligence">
              <Brain className="mr-2 h-4 w-4" />
              Intelligence
            </Link>
          </Button>

          {/* <Button
            variant={isActive('/training') ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/training">
              <GraduationCap className="mr-2 h-4 w-4" />
              Training
            </Link>
          </Button> */}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}