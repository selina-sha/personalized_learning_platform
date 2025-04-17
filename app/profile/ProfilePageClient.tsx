// Client component for tooltip and UI
"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePageClient({ user }: { user: any }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
            <div className="mb-4">
                <Link href="/dashboard">
                <Button variant="outline">← Back to Dashboard</Button>
                </Link>
            </div>
            <div className="flex items-center mb-6">
                <h1 className="text-2xl font-bold">My Profile</h1>
                <div
                className="relative ml-2 w-6 h-6 flex-shrink-0"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                >
                <svg
                    className="w-full h-full text-blue-500 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4m0-4h.01" />
                </svg>
    
              {showTooltip && (
                <div
                  className="
                    absolute 
                    left-full      /* position at the right edge of the icon wrapper */
                    top-1/2        /* vertically center relative to the icon */
                    transform 
                    -translate-y-1/2 /* compensate for top-1/2 */
                    ml-2           /* small gap between icon and tooltip */
                    z-10 
                    w-64 
                    p-2 
                    bg-gray-800 
                    text-white 
                    text-sm 
                    rounded 
                    shadow-lg
                  "
                >
                  Profile information is read-only.
                </div>
              )}
            </div>
          </div>
            <div className="space-y-5">
                <div>
                    <label className="block text-gray-700 font-medium">Username</label>
                    <input
                        type="text"
                        value={user.username}
                        disabled
                        className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Email</label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>
                <div className="relative">
                    <label className="block text-gray-700 font-medium">First Name</label>
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={user.firstName}
                            disabled
                            className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Last Name</label>
                    <input
                        type="text"
                        value={user.lastName}
                        disabled
                        className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Role</label>
                    <input
                        type="text"
                        value={user.role}
                        disabled
                        className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>
            </div>
        </div>
    );
}