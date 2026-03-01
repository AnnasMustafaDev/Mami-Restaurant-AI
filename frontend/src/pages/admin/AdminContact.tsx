import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminGetConfig, adminUpdateConfig } from '../../services/api';

interface ContactContent {
  address_lines: string[];
  phone: string;
  email: string;
  hours: string[];
  map_address: string;
}

const defaultContact: ContactContent = {
  address_lines: [''],
  phone: '',
  email: '',
  hours: [''],
  map_address: '',
};

export default function AdminContact() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ContactContent>(defaultContact);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-config', 'contact'],
    queryFn: () => adminGetConfig('contact'),
    retry: 1,
  });

  useEffect(() => {
    if (data?.value) {
      setForm({ ...defaultContact, ...data.value });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (content: ContactContent) => adminUpdateConfig('contact', content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-config', 'contact'] });
      toast.success('Contact details updated');
    },
    onError: () => toast.error('Failed to update contact details'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const updateAddressLine = (index: number, val: string) => {
    setForm((prev) => ({
      ...prev,
      address_lines: prev.address_lines.map((l, i) => (i === index ? val : l)),
    }));
  };

  const addAddressLine = () => {
    setForm((prev) => ({ ...prev, address_lines: [...prev.address_lines, ''] }));
  };

  const removeAddressLine = (index: number) => {
    setForm((prev) => ({
      ...prev,
      address_lines: prev.address_lines.filter((_, i) => i !== index),
    }));
  };

  const updateHour = (index: number, val: string) => {
    setForm((prev) => ({
      ...prev,
      hours: prev.hours.map((h, i) => (i === index ? val : h)),
    }));
  };

  const addHour = () => {
    setForm((prev) => ({ ...prev, hours: [...prev.hours, ''] }));
  };

  const removeHour = (index: number) => {
    setForm((prev) => ({
      ...prev,
      hours: prev.hours.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact Details</h1>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact Details</h1>
        <div className="text-center py-8">
          <p className="text-red-600 text-sm font-medium">Failed to load contact details</p>
          <button onClick={() => refetch()} className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Details</h1>
          <p className="text-sm text-gray-500 mt-1">Edit the public contact page information</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Address */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Address</h2>
            <button type="button" onClick={addAddressLine} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
              <Plus size={14} /> Add line
            </button>
          </div>
          <div className="space-y-2">
            {form.address_lines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={line}
                  onChange={(e) => updateAddressLine(i, e.target.value)}
                  placeholder={`Address line ${i + 1}`}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                {form.address_lines.length > 1 && (
                  <button type="button" onClick={() => removeAddressLine(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phone & Email */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="+49 30 239 165 67"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="hello@mamis-berlin.de"
              />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Opening Hours</h2>
            <button type="button" onClick={addHour} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
              <Plus size={14} /> Add line
            </button>
          </div>
          <div className="space-y-2">
            {form.hours.map((hour, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => updateHour(i, e.target.value)}
                  placeholder="e.g. Montag: Geschlossen"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                {form.hours.length > 1 && (
                  <button type="button" onClick={() => removeHour(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map Address */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Map</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Map Display Address</label>
            <input
              type="text"
              value={form.map_address}
              onChange={(e) => setForm({ ...form, map_address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Oderberger Straße 13, 10435 Berlin"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
          >
            <Save size={16} />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
