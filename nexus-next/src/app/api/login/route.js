import { NextResponse } from 'next/server';

const USERS = {
  '1': { password: '1', role: 'admin', name: 'Master Admin' },
  admin: { password: 'admin123', role: 'admin', name: 'Command Admin' },
  user: { password: 'user123', role: 'user', name: 'Citizen Observer' }
};

export async function POST(request) {
  const { username, password } = await request.json();
  const user = USERS[username];

  if (user && user.password === password) {
    return NextResponse.json({ 
      success: true, 
      token: `mock-jwt-${user.role}`, 
      user: { name: user.name, role: user.role } 
    });
  } else {
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  }
}
