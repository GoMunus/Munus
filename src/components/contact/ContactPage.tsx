import React, { useState } from 'react';
import { sendContactMessage } from '../../services/contactService';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await sendContactMessage(form);
      setSuccess('Your message has been sent! We will get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
        {success && <div className="text-green-600 text-center font-medium mt-2">{success}</div>}
        {error && <div className="text-red-600 text-center font-medium mt-2">{error}</div>}
      </form>
    </div>
  );
}; 