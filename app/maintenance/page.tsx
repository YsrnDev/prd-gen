import type { Metadata } from 'next';
import MaintenanceClient from './MaintenanceClient';

export const metadata: Metadata = {
    title: 'Under Maintenance | PRDGen AI',
    description: 'PRDGen AI is currently undergoing scheduled maintenance. We will be back shortly.',
    robots: { index: false },
};

export default function MaintenancePage() {
    return <MaintenanceClient />;
}
