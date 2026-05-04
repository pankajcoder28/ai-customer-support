import React, { useState } from 'react';
import { Send, Zap, MessageSquare } from 'lucide-react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AI = () => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Getting AI response...');

    try {
      // Get AI response
      const responseData = await aiAPI.getAIResponse(message);
      const aiResponse = responseData.data?.aiResponse || responseData.aiResponse;

      // Analyze sentiment
      const sentimentData = await aiAPI.analyzeSentiment(message);
      const sentimentScore = sentimentData.data?.sentiment || sentimentData.sentiment;

      // Add to responses
      setResponses([
        {
          userMessage: message,
          aiResponse,
          sentiment: sentimentScore,
          timestamp: new Date()
        },
        ...responses
      ]);

      setSentiment(sentimentScore);
      setMessage('');
      toast.success('Response generated!', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to get AI response', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'bg-gray-50 text-gray-600';
    const score = sentiment.score;
    if (score > 0.1) return 'bg-green-50 text-green-600';
    if (score < -0.1) return 'bg-red-50 text-red-600';
    return 'bg-yellow-50 text-yellow-600';
  };

  const getSentimentLabel = (sentiment) => {
    if (!sentiment) return 'Neutral';
    if (sentiment.score > 0.1) return 'Positive';
    if (sentiment.score < -0.1) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-orange-500" size={28} />
            <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          </div>
          <p className="text-gray-500">Test AI responses and analyze customer sentiment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Test AI Response</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    placeholder="Enter a customer message..."
                    className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 resize-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {loading ? 'Processing...' : 'Get AI Response'}
                </button>
              </form>
            </div>

            {/* Responses */}
            {responses.length > 0 && (
              <div className="mt-6 space-y-4">
                {responses.map((response, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-600 uppercase mb-2">Customer Message</h3>
                      <p className="text-gray-800">{response.userMessage}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <h3 className="text-sm font-bold text-gray-600 uppercase mb-2">AI Response</h3>
                      <p className="text-gray-800 leading-relaxed">{response.aiResponse}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSentimentColor(response.sentiment)}`}>
                        Sentiment: {getSentimentLabel(response.sentiment)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {response.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Sentiment */}
            {sentiment && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase mb-4">Current Sentiment</h3>
                <div className={`${getSentimentColor(sentiment)} p-4 rounded-xl text-center mb-4`}>
                  <p className="text-2xl font-bold">{getSentimentLabel(sentiment)}</p>
                  <p className="text-sm opacity-75 mt-1">
                    Score: {(sentiment.score * 100).toFixed(1)}%
                  </p>
                </div>
                
                {sentiment.comparative !== undefined && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comparative:</span>
                      <span className="font-bold text-gray-800">{sentiment.comparative.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-600 uppercase mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Responses</span>
                  <span className="text-xl font-bold text-gray-900">{responses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Positive</span>
                  <span className="text-xl font-bold text-green-600">
                    {responses.filter(r => r.sentiment?.score > 0.1).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Negative</span>
                  <span className="text-xl font-bold text-red-600">
                    {responses.filter(r => r.sentiment?.score < -0.1).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Neutral</span>
                  <span className="text-xl font-bold text-yellow-600">
                    {responses.filter(r => !r.sentiment || (r.sentiment.score >= -0.1 && r.sentiment.score <= 0.1)).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
              <div className="flex gap-2">
                <MessageSquare size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-orange-900">How it works</p>
                  <p className="text-xs text-orange-700 mt-1">
                    Enter a customer message to see AI-generated responses and sentiment analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
