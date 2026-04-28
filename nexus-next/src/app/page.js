'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token) {
      router.replace('/portal');
    } else {
      router.replace(role === 'admin' ? '/admin' : '/user');
    }
  }, [router]);

  return (
    <div className="preloader">
      <div className="preloader-content">
        <div className="loader-ring" />
      </div>
    </div>
  );
}
