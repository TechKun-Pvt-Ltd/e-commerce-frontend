import React from 'react';
import Header from '../components/Header';

export default function SettingsLayout({children}: {children: React.ReactNode}) {
    return (
        <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{children}</div>
        </div>
    );
}