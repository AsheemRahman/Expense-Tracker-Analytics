'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-gray-600 dark:text-gray-400">Redirecting...</div>
    </div>
  );
}