import type { Metadata } from 'next';
import MaintenanceClient from './MaintenanceClient';

export const metadata: Metadata = {
    title: 'Under Maintenance',
    description: 'Lucky Brew is currently undergoing scheduled maintenance. We will be back shortly.',
    robots: { index: false },
};

export default function MaintenancePage() {
    return <MaintenanceClient />;
}
