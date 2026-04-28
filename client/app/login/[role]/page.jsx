'use client';
import { useParams } from 'next/navigation';
import LoginPage from '../../../components/LoginPage';

export default function Login() {
  const params = useParams();
  // We pass the role to the login page if needed, though LoginPage usually handles its own state or URL.
  return <LoginPage />;
}
