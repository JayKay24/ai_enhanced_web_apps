"use client";
import React from "react";
import { UserButton, Show } from "@clerk/nextjs";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full px-4 sm:px-6">
      <div className="sticky top-0 z-40 flex justify-between items-center py-1.5 w-full">
        <a href="/">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <span role="img" aria-label="eight-pointed star">
              ✴️
            </span>{" "}
            Astra AI
          </h1>
        </a>
        <div className="flex items-center gap-4">
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
