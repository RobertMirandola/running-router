import { MapDisplay } from './components/MapDisplay';
import { MapsProvider } from './providers/MapsProvider';

export default function Home() {
  return (
    <MapsProvider>
      <MapDisplay/>
    </MapsProvider>
  );
}
