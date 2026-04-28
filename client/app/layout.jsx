import './globals.css';

export const metadata = {
  title: 'Bengaluru Nexus | Digital Twin',
  description: 'Advanced Urban Governance & Simulation Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
