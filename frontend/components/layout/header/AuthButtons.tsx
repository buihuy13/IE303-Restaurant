"use client";

import { ChevronDown, User } from "lucide-react";

import { Button } from "@/components/ui";

import { HeaderDropdown } from "./HeaderDropdown";

const MOCK_USER = {
  name: "John Doe",
  email: "john.doe@example.com",
};

export function AuthButtons() {
  const isAuth = true;

  if (!isAuth) {
    return (
      <>
        <Button className="gap-2" variant="ghost">
          <User className="h-4 w-4" />
          Login
        </Button>
        <Button>Sign up</Button>
      </>
    );
  }

  return (
    <HeaderDropdown
      align="right"
      widthClass="w-56"
      trigger={({ toggle }) => (
        <Button
          type="button"
          onClick={toggle}
          variant="ghost"
          className="flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm text-brand-black hover:border-stroke"
        >
          <User className="h-5 w-5 text-brand-purple" />
          <span className="hidden sm:inline">{MOCK_USER.name}</span>
          <ChevronDown className="h-4 w-4 text-brand-grey" />
        </Button>
      )}
    >
      {({ close }) => (
        <div className="py-2 text-sm">
          <div className="border-b px-3 pb-2">
            <p className="font-medium text-brand-black">{MOCK_USER.name}</p>
            <p className="text-xs text-brand-grey">{MOCK_USER.email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="flex w-full justify-start rounded-none px-3 py-2 text-left text-brand-grey hover:bg-gray-50"
            onClick={close}
          >
            My orders
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex w-full justify-start rounded-none px-3 py-2 text-left text-brand-grey hover:bg-gray-50"
            onClick={close}
          >
            Settings
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex w-full justify-start rounded-none px-3 py-2 text-left text-brand-grey hover:bg-gray-50"
            onClick={close}
          >
            Sign out
          </Button>
        </div>
      )}
    </HeaderDropdown>
  );
}

