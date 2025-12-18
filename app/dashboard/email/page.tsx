/**
 * Email Generator Page
 *
 * Dedicated page for generating availability emails with Claude AI integration.
 * Uses LibreUIUX Luxury/Refined aesthetic matching the rest of the calendar.
 *
 * @module app/dashboard/email
 *
 * Features:
 * - EmailGenerator component with Claude AI
 * - Glassmorphism container with gradient background
 * - Responsive layout matching dashboard aesthetic
 * - Professional header with description
 *
 * @see components/dashboard/EmailGenerator
 * @see app/api/email/generate
 */

'use client';

import { useState, useEffect } from 'react';
import EmailGenerator from '@/components/dashboard/EmailGenerator';

export default function EmailPage() {
  const [instructorData, setInstructorData] = useState<{
    name: string;
    email: string;
    calendarLink: string;
  } | null>(null);

  useEffect(() => {
    // Load instructor profile from localStorage
    // This matches the pattern used in the calendar for persistence
    const loadProfile = () => {
      try {
        const profileData = localStorage.getItem('instructorProfile');
        if (profileData) {
          const profile = JSON.parse(profileData);
          setInstructorData({
            name: profile.name || 'Instructor',
            email: profile.email || 'instructor@example.com',
            calendarLink: profile.publicUrl || window.location.origin + '/calendar/' + (profile.slug || 'instructor'),
          });
        } else {
          // Default fallback if no profile exists
          setInstructorData({
            name: 'Instructor',
            email: 'instructor@example.com',
            calendarLink: window.location.origin + '/calendar/instructor',
          });
        }
      } catch (error) {
        console.error('Failed to load instructor profile:', error);
        // Fallback data
        setInstructorData({
          name: 'Instructor',
          email: 'instructor@example.com',
          calendarLink: window.location.origin + '/calendar/instructor',
        });
      }
    };

    loadProfile();
  }, []);

  if (!instructorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Page Header with Gradient Background */}
      <div className="
        relative
        backdrop-blur-md
        bg-gradient-to-r from-white/80 via-white/90 to-white/80
        border-b border-gray-200/50
        px-6 py-8 md:px-8 md:py-10
        shadow-[0_2px_8px_rgba(0,0,0,0.04)]
      ">
        {/* Decorative top accent */}
        <div className="
          absolute top-0 left-0 right-0
          h-1
          bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent
        " />

        <div className="max-w-4xl mx-auto">
          <h1 className="
            text-3xl md:text-4xl font-bold
            bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600
            bg-clip-text text-transparent
            drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]
          ">
            Email Generator
          </h1>
          <p className="mt-3 text-gray-600 text-lg max-w-2xl">
            Generate professional availability emails powered by Claude AI.
            Your email will include intelligent, context-aware messaging and a downloadable calendar file.
          </p>
        </div>
      </div>

      {/* Main Content with Glassmorphism Container */}
      <div className="
        max-w-4xl mx-auto
        px-6 py-8 md:px-8 md:py-10
      ">
        <div className="
          relative
          backdrop-blur-md
          bg-white/60
          border border-gray-200/50
          rounded-2xl
          shadow-[0_8px_30px_rgba(0,0,0,0.06)]
          p-6 md:p-8
          transition-all duration-300 ease-out
          hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]
          hover:bg-white/80
        ">
          {/* Noise texture overlay */}
          <div className="
            absolute inset-0
            bg-[url('/noise.svg')] opacity-5
            mix-blend-overlay
            pointer-events-none
            rounded-2xl
          " />

          {/* Content */}
          <div className="relative z-10">
            <EmailGenerator
              instructorName={instructorData.name}
              instructorEmail={instructorData.email}
              calendarLink={instructorData.calendarLink}
            />
          </div>

          {/* Decorative corner accent */}
          <div className="
            absolute bottom-0 right-0
            h-24 w-24
            bg-gradient-to-tl from-indigo-400/10 to-transparent
            rounded-tl-full
            pointer-events-none
          " />
        </div>

        {/* Help Text */}
        <div className="
          mt-6
          p-4
          bg-blue-50/50 backdrop-blur-sm
          border border-blue-200/50
          rounded-xl
          shadow-[0_2px_8px_rgba(0,0,0,0.04)]
        ">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How it works
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Add an optional custom message to personalize your email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Click "Generate Email" to create AI-powered professional text using Claude</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Copy HTML or plain text version to paste into your email client</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Download the .ics calendar file to attach to your email for easy calendar import</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
