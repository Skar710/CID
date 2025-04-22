import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white space-y-8">
          <div className="flex justify-center">
            <Shield className="h-20 w-20" />
          </div>
          <h1 className="text-5xl font-bold">Crime Investigation Department</h1>
          <p className="text-xl max-w-2xl mx-auto">
            A comprehensive platform for analyzing and visualizing crime data to help law enforcement agencies, policymakers, and researchers make data-driven decisions.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="secondary" size="lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}