/**
 * Settings Page - Slug Management
 *
 * Purpose: Manage instructor profile and public calendar settings
 *
 * Features:
 * - Set instructor slug for shareable URL
 * - Generate public calendar URL
 * - Copy-to-clipboard functionality
 * - Display current slug and URL
 *
 * MVP Implementation:
 * - localStorage for slug storage
 * - No authentication (Phase 2)
 * - No database persistence (Phase 2)
 *
 * @see specs/SPEC-V2.md Lines 104-108 for shareable URL requirements
 * @see docs/IMPLEMENTATION-PLAN-V2.md Phase 7 for implementation details
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import slugify from 'slugify';
import { Copy, Check } from 'lucide-react';

const STORAGE_KEY = 'cal_instructor_profile';

interface InstructorSettings {
  slug: string;
  displayName: string;
  email: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<InstructorSettings>({
    slug: '',
    displayName: '',
    email: '',
  });
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Generate public URL
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';
  const publicUrl = settings.slug
    ? `${baseUrl}/calendar/${settings.slug}`
    : '';

  // Handle slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const slugified = slugify(value, {
      lower: true,
      strict: true,
      trim: true,
    });
    setSettings((prev) => ({ ...prev, slug: slugified }));
  };

  // Handle display name change
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, displayName: e.target.value }));
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, email: e.target.value }));
  };

  // Save settings to localStorage
  const handleSave = () => {
    if (typeof window === 'undefined') return;

    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setTimeout(() => setIsSaving(false), 300);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setIsSaving(false);
    }
  };

  // Copy URL to clipboard
  const handleCopy = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your public calendar settings and shareable URL
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Instructor Profile</h2>

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Dr. John Smith"
              value={settings.displayName}
              onChange={handleDisplayNameChange}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Your name as shown on the public calendar
            </p>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={settings.email}
              onChange={handleEmailChange}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Used for the "Contact to Book" button
            </p>
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">Calendar URL Slug</Label>
            <Input
              id="slug"
              type="text"
              placeholder="john-instructor"
              value={settings.slug}
              onChange={handleSlugChange}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving || !settings.slug}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>

      {/* Public URL Display */}
      {publicUrl && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Shareable Calendar URL</h2>

          <div className="space-y-4">
            <div>
              <Label>Your Public Calendar Link</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopy} variant="outline">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Share this link with students to let them view your availability
              </p>
            </div>

            {/* Preview Link */}
            <div>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Preview public calendar →
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
