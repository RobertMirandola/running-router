import { MapsProvider } from "../providers/MapsProvider";
import { MapDisplay } from "../components/MapDisplay";

export default function CreatePage() {
  return (
    <div className="h-full w-full">
      <MapsProvider>
        <MapDisplay />
      </MapsProvider>
    </div>
  );
}
