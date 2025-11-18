'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface OperationStatus {
  success: boolean;
  error?: string;
}

interface DatabaseStatus {
  read: OperationStatus;
  update: OperationStatus;
  delete: OperationStatus;
}

export default function DatabaseStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    loadDatabaseStatus();
  }, [router]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Basic ${token}`,
    };
  };

  const loadDatabaseStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/admin/database-status`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to load database status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load database status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (success: boolean): string => {
    return success ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (success: boolean): string => {
    return success ? 'OK' : 'FAIL';
  };

  const getErrorMessages = (): string => {
    if (!status) return '';
    
    const errors: string[] = [];
    if (!status.read.success && status.read.error) {
      errors.push(`READ: ${status.read.error}`);
    }
    if (!status.update.success && status.update.error) {
      errors.push(`UPDATE: ${status.update.error}`);
    }
    if (!status.delete.success && status.delete.error) {
      errors.push(`DELETE: ${status.delete.error}`);
    }
    
    return errors.join('\n\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading database status... 🔌</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SQL Server Connection Status</h1>
          <p className="text-gray-600">Monitor the health of database operations</p>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex gap-4">
          <a
            href="/admin/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Back to Dashboard
          </a>
          <button
            onClick={loadDatabaseStatus}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh Status
          </button>
        </div>

        {/* Connection Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">❌</div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Connection Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Lights */}
        {status && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Read Operation */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-500">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-4">READ OPERATION</div>
                  <div className={`mx-auto w-24 h-24 rounded-full ${getStatusColor(status.read.success)} flex items-center justify-center shadow-lg`}>
                    <div className="text-white text-3xl font-bold">
                      {status.read.success ? '✓' : '✗'}
                    </div>
                  </div>
                  <div className="mt-4 text-xl font-bold text-gray-900">
                    {getStatusText(status.read.success)}
                  </div>
                  {!status.read.success && (
                    <div className="mt-2 text-sm text-red-600">
                      Database read failed
                    </div>
                  )}
                </div>
              </div>

              {/* Update Operation */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-yellow-500">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-4">UPDATE OPERATION</div>
                  <div className={`mx-auto w-24 h-24 rounded-full ${getStatusColor(status.update.success)} flex items-center justify-center shadow-lg`}>
                    <div className="text-white text-3xl font-bold">
                      {status.update.success ? '✓' : '✗'}
                    </div>
                  </div>
                  <div className="mt-4 text-xl font-bold text-gray-900">
                    {getStatusText(status.update.success)}
                  </div>
                  {!status.update.success && (
                    <div className="mt-2 text-sm text-red-600">
                      Database update failed
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Operation */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-purple-500">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-4">DELETE OPERATION</div>
                  <div className={`mx-auto w-24 h-24 rounded-full ${getStatusColor(status.delete.success)} flex items-center justify-center shadow-lg`}>
                    <div className="text-white text-3xl font-bold">
                      {status.delete.success ? '✓' : '✗'}
                    </div>
                  </div>
                  <div className="mt-4 text-xl font-bold text-gray-900">
                    {getStatusText(status.delete.success)}
                  </div>
                  {!status.delete.success && (
                    <div className="mt-2 text-sm text-red-600">
                      Database delete failed
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Details */}
            {(!status.read.success || !status.update.success || !status.delete.success) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Error Details</h2>
                <textarea
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none"
                  value={getErrorMessages()}
                  readOnly
                />
                <p className="mt-2 text-sm text-gray-600">
                  These are the specific SQL errors encountered during the connection tests.
                </p>
              </div>
            )}

            {/* Success Message */}
            {status.read.success && status.update.success && status.delete.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">All Systems Operational</h3>
                    <p className="text-green-700">
                      All database operations (READ, UPDATE, DELETE) are working correctly.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
