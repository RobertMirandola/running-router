import { AppLayout } from './components/AppLayout';
import { MapsProvider } from './providers/MapsProvider';

export default function Home() {
  return (
    <MapsProvider>
      <AppLayout />
    </MapsProvider>
  );
}
