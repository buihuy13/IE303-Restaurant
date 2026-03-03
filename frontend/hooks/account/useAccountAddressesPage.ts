import { useState } from "react";

type MockAddress = {
  id: string;
  label: string;
  detail: string;
};

const initialAddresses: MockAddress[] = [
  {
    id: "addr-1",
    label: "Home",
    detail: "123 Mock Street, District 1, HCMC",
  },
  {
    id: "addr-2",
    label: "Office",
    detail: "456 Dev Avenue, District 3, HCMC",
  },
];

export function useAccountAddressesPage() {
  const [addresses, setAddresses] =
    useState<MockAddress[]>(initialAddresses);

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    addresses,
    removeAddress,
  };
}

