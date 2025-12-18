'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, FileJson } from 'lucide-react';
import { persistence } from '@/lib/data/persistence';

export default function ImportPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus('idle');
    setMessage('');

    try {
      // Read file content
      const content = await file.text();

      // Validate JSON
      try {
        JSON.parse(content);
      } catch {
        throw new Error('Invalid JSON file format');
      }

      // Import data through persistence layer
      await persistence.importData(content);

      setStatus('success');
      setMessage('Calendar data imported successfully! Refresh the page to see changes.');
    } catch (error) {
      console.error('Import error:', error);
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to import data. Please check the file format.'
      );
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <Upload className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Import Calendar Data
          </h1>
          <p className="text-gray-600">
            Restore your calendar from a previously exported backup file
          </p>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Import Information */}
        <div className="mb-8 space-y-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-green-900 mb-2">
              What will be imported:
            </h2>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• All blocked dates from backup file</li>
              <li>• Instructor profile settings</li>
              <li>• Previous sync information</li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-red-900 mb-2">
              ⚠️ Important warning:
            </h2>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Import will REPLACE current calendar data</li>
              <li>• Export current data before importing</li>
              <li>• Only import files from trusted sources</li>
              <li>• Refresh page after successful import</li>
            </ul>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={handleButtonClick}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <FileJson className="h-5 w-5" />
            <span>Choose JSON File to Import</span>
          </button>

          {fileName && (
            <div className="mt-3 text-sm text-gray-600 text-center">
              Selected: <span className="font-medium">{fileName}</span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Accepted format: JSON files exported from this application
          </p>
        </div>
      </div>
    </div>
  );
}
