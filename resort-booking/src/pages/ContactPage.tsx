import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import PublicLayout from '../components/layout/PublicLayout';
import AnimatedSection from '../components/ui/AnimatedSection';
import Button from '../components/ui/Button';
import { sendContactMessageEmail } from '../lib/bookingEmail';
import { loadSmtpNotificationSettings } from '../lib/smtpSettings';
import { useSiteSettings } from '../context/SiteDataContext';

const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const settings = useSiteSettings();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Villa enquiry',
    message: '',
  });

  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    const propertyName = searchParams.get('property');
    const propertyId = searchParams.get('id');

    if (subjectParam === 'purchase' || propertyName) {
      const title = propertyName ?? 'a property';
      const ref = propertyId ? ` (Ref: ${propertyId})` : '';
      setForm((prev) => ({
        ...prev,
        subject: 'Property purchase enquiry',
        message:
          prev.message ||
          `Hi,\n\nI am interested in purchasing: ${title}${ref}.\n\nPlease share pricing details, site visit availability, and required documents.\n\nThank you.`,
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const prefs = loadSmtpNotificationSettings();
      await sendContactMessageEmail({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
        adminEmail: prefs.adminNotificationEmail.trim() || settings.resortEmail,
        resortName: settings.resortName,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout currentPage="contact">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <AnimatedSection>
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 mb-3">Contact us</h1>
            <p className="text-2xl text-gray-900 max-w-2xl">{settings.contactPageSubtitle}</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <AnimatedSection className="lg:col-span-1 space-y-6">
            {(settings.contactName.trim() || settings.contactBio.trim()) && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                {settings.contactName.trim() ? (
                  <p className="text-xl font-bold text-gray-900">{settings.contactName}</p>
                ) : null}
                {settings.contactBio.trim() ? (
                  <p className="text-lg text-gray-900 mt-2">{settings.contactBio}</p>
                ) : null}
              </div>
            )}
            {[
              { icon: MapPinIcon, label: 'Reservations office', value: settings.resortAddress, href: undefined },
              {
                icon: PhoneIcon,
                label: 'Phone / WhatsApp',
                value: settings.resortPhone,
                href: settings.resortPhone.trim() ? `tel:${settings.resortPhone.replace(/\s/g, '')}` : undefined,
              },
              {
                icon: EnvelopeIcon,
                label: 'Email',
                value: settings.resortEmail,
                href: settings.resortEmail.trim() ? `mailto:${settings.resortEmail}` : undefined,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex gap-4"
              >
                <item.icon className="h-8 w-8 text-airbnb-red shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-lg font-medium text-gray-900 mt-1 hover:text-airbnb-red transition-colors block">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-lg font-medium text-gray-900 mt-1">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-xl overflow-hidden h-48 shadow-sm border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                alt="Lonavala hills"
                className="w-full h-full object-cover"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150} className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <p className="text-2xl font-bold text-gray-900 mb-2">Thank you!</p>
                  <p className="text-xl text-gray-900">
                    Your message was sent. We will reply within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {submitError ? (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-base">
                      {submitError}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-1">Name</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red/30"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red/30"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-1">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red/30"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-1">Subject</label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red/30"
                      >
                        <option>Villa enquiry</option>
                        <option>Property purchase enquiry</option>
                        <option>Facilities & events</option>
                        <option>Group booking</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red/30"
                      placeholder="Tell us about the property you are interested in, your budget, or any questions..."
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    className="rounded-full btn-primary-motion"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending…' : 'Send message'}
                  </Button>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ContactPage;
