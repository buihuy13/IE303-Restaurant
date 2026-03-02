"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";
import { HeaderDropdown } from "./HeaderDropdown";

type LocationOption = {
  id: string;
  label: string;
};

const MOCK_LOCATIONS: LocationOption[] = [
  { id: "ktx-a", label: "KTX Area A, Di An" },
  { id: "ktx-b", label: "KTX Area B, Di An" },
  { id: "thu-duc", label: "Thu Duc City, Ho Chi Minh" },
  { id: "dist1", label: "District 1, Ho Chi Minh" },
];

export function LocationSelector() {
  const [currentLocation, setCurrentLocation] = useState<LocationOption>(MOCK_LOCATIONS[0]);

  return (
    <HeaderDropdown
      align="left"
      widthClass="w-72"
      trigger={({ toggle }) => (
        <Button
          className="flex items-center gap-2 rounded-md border border-transparent bg-brand-yellowlight/60 px-3 py-2 text-left transition hover:border-stroke"
          type="button"
          variant="ghost"
          onClick={toggle}
        >
          <MapPin className="h-5 w-5 text-brand-purple" />
          <div className="leading-tight">
            <p className="text-xs text-brand-grey">Deliver to:</p>
            <p className="font-semibold text-brand-black">{currentLocation.label}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-brand-grey" />
        </Button>
      )}
    >
      {({ close }) => (
        <ul className="max-h-64 overflow-auto py-2 text-sm">
          {MOCK_LOCATIONS.map((option) => (
            <li key={option.id}>
              <Button
                type="button"
                variant="ghost"
                className="flex w-full items-start rounded-none px-3 py-2 text-left text-brand-grey hover:bg-gray-50"
                onClick={() => {
                  setCurrentLocation(option);
                  close();
                }}
              >
                <span className="truncate">{option.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </HeaderDropdown>
  );
}

