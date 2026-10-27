import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ContactPage: React.FC = () => {
  const { settings, submitContactMessage, language } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill in your name, phone number, and query message.');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        name,
        email: email || 'unspecified@example.com',
        phone,
        subject: subject || 'General Academic Inquiry',
        message,
      });

      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError('Failed to transmit message. Please try calling directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappLink = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Shikshyalaya%20Shaikshik%20Sanstha,%20I%20would%20like%20to%20inquire%20about%20your%20tuition%20batches.`
    : '#';

  return (
    <div className="py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Phone className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12315A] tracking-tight">
          Contact Shikshyalaya Shaikshik Sanstha
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Have questions regarding batch schedules, subjects, or enrollment? Our administrative team is here to assist you.
        </p>
      </div>


      {/* Main Grid: Details (Left) + Form (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Info Cards & WhatsApp Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-[#12315A]">
                Institute Contact Details
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Physical Location</h4>
                    <p className="text-slate-600 mt-0.5">{settings.physicalAddress}</p>
                    <p className="text-slate-500 text-xs">{settings.city}, {settings.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Phone Inquiries</h4>
                    <a href={`tel:${settings.contactNumber}`} className="text-blue-700 font-semibold block hover:underline">
                      {settings.contactNumber}
                    </a>
                    {settings.contactNumberAlt && settings.contactNumberAlt !== settings.contactNumber && (
                      <a href={`tel:${settings.contactNumberAlt}`} className="text-slate-500 block hover:underline text-xs">
                        {settings.contactNumberAlt}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Email Address</h4>
                    <a href={`mailto:${settings.emailAddress}`} className="text-blue-700 font-semibold hover:underline">
                      {settings.emailAddress}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Office Working Hours</h4>
                    <p className="text-slate-600 mt-0.5 leading-snug">{settings.officeHours}</p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action Button */}
              <div className="pt-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2.5 shadow-md"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Inquire Directly on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Social Channels Card */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/90 text-xs space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Verified Social Channels
              </h4>
              <p className="text-slate-500">
                Follow our official social pages for exam schedules, model question releases, and notices.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold flex items-center gap-1.5 hover:bg-blue-700"
                >
                  <span>Facebook</span>
                </a>
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold flex items-center gap-1.5 hover:bg-red-700"
                >
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#12315A]">
                  Send a Message to the Administration
                </h3>
                <p className="text-xs text-slate-500">
                  Fill out the form below. We will respond promptly within working hours.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Message Transmitted!</h4>
                  <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                    Thank you for reaching out. Your message has been safely recorded in the institute correspondence inbox.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sujan Karki"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Contact Phone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9767648342 / 98XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="sujan@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TU MBS evening batch inquiry"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Your Query or Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Type your questions regarding our academic tuition, examination notes, or teacher details..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>{submitting ? 'Transmitting Message...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
