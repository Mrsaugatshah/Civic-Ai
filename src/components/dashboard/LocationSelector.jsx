import { MapPin } from "lucide-react";
import { toast } from "sonner";

import { LOCATIONS } from "@/services/citizen/citizenService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LocationSelector({ value, onValueChange }) {
  const handleChange = (next) => {
    onValueChange?.(next);
    toast.success(`Location set to ${next}`);
  };

  return (
    <div className="w-full max-w-xs">
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger
          aria-label="Select your location"
          className="h-10 bg-background/80 shadow-soft backdrop-blur-sm"
        >
          <MapPin size={15} className="text-primary" />
          <SelectValue placeholder="Select a location" />
        </SelectTrigger>
        <SelectContent>
          {LOCATIONS.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
