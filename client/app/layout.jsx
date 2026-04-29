import './globals.css';

export const metadata = {
  title: 'Bengaluru Nexus | Digital Twin',
  description: 'Advanced Urban Governance & Simulation Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
