import { MapDisplay } from './components/MapDisplay';
import { MapsProvider } from './components/MapsProvider';

export default function Home() {
  return (
    <MapsProvider>
      <MapDisplay/>
    </MapsProvider>
  );
}
