'use client';

import { useState } from 'react';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { persistence } from '@/lib/data/persistence';

export default function ExportPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    try {
      setStatus('idle');
      setMessage('');

      // Get data from persistence layer
      const jsonData = await persistence.exportData();

      // Create blob and download
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus('success');
      setMessage('Calendar data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      setStatus('error');
      setMessage('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <Download className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Export Calendar Data
          </h1>
          <p className="text-gray-600">
            Download a backup of your calendar availability and settings
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

        {/* Export Information */}
        <div className="mb-8 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">
              What will be exported:
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All blocked dates (full day, AM, PM)</li>
              <li>• Instructor profile and settings</li>
              <li>• Last sync timestamp</li>
              <li>• Export metadata (version, date)</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-yellow-900 mb-2">
              Recommended usage:
            </h2>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Create backups before major changes</li>
              <li>• Export weekly for data safety</li>
              <li>• Store backups in a secure location</li>
              <li>• Use import to restore data if needed</li>
            </ul>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Export Calendar Data</span>
        </button>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            File format: JSON (calendar-backup-YYYY-MM-DD.json)
          </p>
        </div>
      </div>
    </div>
  );
}
