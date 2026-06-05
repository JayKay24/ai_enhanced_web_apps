"use client";
import React from 'react';
import { Show, UserButton, SignInButton } from '@clerk/nextjs';
import { Button } from './ui/button';

const Navbar = () => {
  return (
    <nav className="w-full mx-auto flex justify-between items-center px-4 py-2">
      <a href="/" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        ✴️ Astra Chat
      </a>
      <div className="flex items-center gap-4">
        <Show when="signed-in">
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button size="sm">Sign In</Button>
          </SignInButton>
        </Show>
      </div>
    </nav>
  );
};

export default Navbar;
