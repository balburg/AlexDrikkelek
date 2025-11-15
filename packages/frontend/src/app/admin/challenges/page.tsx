'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Challenge, ChallengeType, AgeRating } from '@/types/game';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: ChallengeType.TRIVIA,
    category: '',
    ageRating: AgeRating.ALL,
    question: '',
    answers: ['', '', '', ''],
    correctAnswer: 0,
    action: '',
    points: 10,
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    loadChallenges();
  }, [router]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`,
    };
  };

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/admin/challenges`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to load challenges');
      }

      const data = await response.json();
      setChallenges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      const challengeData: Omit<Challenge, 'id'> = {
        type: formData.type,
        category: formData.category,
        ageRating: formData.ageRating,
        points: formData.points,
        ...(formData.type === ChallengeType.TRIVIA ? {
          question: formData.question,
          answers: formData.answers.filter(a => a.trim() !== ''),
          correctAnswer: formData.correctAnswer,
        } : {
          action: formData.action,
        }),
      };

      const response = await fetch(`${API_URL}/api/admin/challenges`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(challengeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create challenge');
      }

      setSuccessMessage('Challenge created successfully! 🎉');
      setShowModal(false);
      resetForm();
      await loadChallenges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
    }
  };

  const handleUpdate = async () => {
    if (!editingChallenge) return;

    try {
      setError(null);
      setSuccessMessage(null);

      const updates: Partial<Omit<Challenge, 'id'>> = {
        type: formData.type,
        category: formData.category,
        ageRating: formData.ageRating,
        points: formData.points,
        ...(formData.type === ChallengeType.TRIVIA ? {
          question: formData.question,
          answers: formData.answers.filter(a => a.trim() !== ''),
          correctAnswer: formData.correctAnswer,
        } : {
          action: formData.action,
        }),
      };

      const response = await fetch(`${API_URL}/api/admin/challenges/${editingChallenge.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update challenge');
      }

      setSuccessMessage('Challenge updated successfully! ✅');
      setShowModal(false);
      setEditingChallenge(null);
      resetForm();
      await loadChallenges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update challenge');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/challenges/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete challenge');
      }

      setSuccessMessage('Challenge deleted successfully! 🗑️');
      await loadChallenges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete challenge');
    }
  };

  const openModal = (challenge?: Challenge) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setFormData({
        type: challenge.type,
        category: challenge.category,
        ageRating: challenge.ageRating,
        question: challenge.question || '',
        answers: challenge.answers || ['', '', '', ''],
        correctAnswer: challenge.correctAnswer || 0,
        action: challenge.action || '',
        points: challenge.points,
      });
    } else {
      setEditingChallenge(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: ChallengeType.TRIVIA,
      category: '',
      ageRating: AgeRating.ALL,
      question: '',
      answers: ['', '', '', ''],
      correctAnswer: 0,
      action: '',
      points: 10,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading challenges... 🎯</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Challenges & Trivia Management</h1>
          <p className="text-gray-600">Create and manage challenge questions and trivia cards</p>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex gap-4">
          <a
            href="/admin/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            + Create New Challenge
          </button>
        </div>

        {/* Challenges List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challenges.map((challenge) => (
                  <tr key={challenge.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        challenge.type === ChallengeType.TRIVIA ? 'bg-blue-100 text-blue-800' :
                        challenge.type === ChallengeType.ACTION ? 'bg-green-100 text-green-800' :
                        challenge.type === ChallengeType.DARE ? 'bg-orange-100 text-orange-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {challenge.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challenge.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {challenge.question || challenge.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challenge.ageRating}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challenge.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal(challenge)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(challenge.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
              <h2 className="text-2xl font-bold mb-4">
                {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ChallengeType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {Object.values(ChallengeType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Rating</label>
                    <select
                      value={formData.ageRating}
                      onChange={(e) => setFormData({ ...formData, ageRating: e.target.value as AgeRating })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {Object.values(AgeRating).map((rating) => (
                        <option key={rating} value={rating}>{rating}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., General Knowledge"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {formData.type === ChallengeType.TRIVIA ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <textarea
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                        placeholder="Enter your trivia question..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answers</label>
                      {formData.answers.map((answer, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            checked={formData.correctAnswer === index}
                            onChange={() => setFormData({ ...formData, correctAnswer: index })}
                            className="h-4 w-4"
                          />
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => {
                              const newAnswers = [...formData.answers];
                              newAnswers[index] = e.target.value;
                              setFormData({ ...formData, answers: newAnswers });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder={`Answer ${index + 1}`}
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 mt-1">Select the correct answer with the radio button</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action/Dare</label>
                    <textarea
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="Enter the action or dare..."
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingChallenge(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingChallenge ? handleUpdate : handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingChallenge ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
