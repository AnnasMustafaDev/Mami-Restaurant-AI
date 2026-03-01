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
        <h1 className="text-2xl font-bold font-[Poppins] text-text mb-6">Contact Details</h1>
        <div className="text-text-secondary text-sm">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold font-[Poppins] text-text mb-6">Contact Details</h1>
        <div className="text-center py-8">
          <p className="text-error text-sm font-medium">Failed to load contact details</p>
          <button onClick={() => refetch()} className="mt-3 text-xs text-primary hover:text-primary-dark font-medium transition-colors duration-200">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-[Poppins] text-text">Contact Details</h1>
          <p className="text-sm text-text-secondary mt-1">Edit the public contact page information</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-primary/5 rounded-[--radius-md] hover:bg-bg transition-colors duration-200"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Address */}
        <div className="bg-card rounded-[--radius-lg] border border-primary/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-[Poppins] text-text">Address</h2>
            <button type="button" onClick={addAddressLine} className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors duration-200">
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
                  className="flex-1 px-3 py-2 border border-primary/5 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                />
                {form.address_lines.length > 1 && (
                  <button type="button" onClick={() => removeAddressLine(i)} className="text-error/60 hover:text-error transition-colors duration-200">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phone & Email */}
        <div className="bg-card rounded-[--radius-lg] border border-primary/5 shadow-sm p-6">
          <h2 className="text-lg font-semibold font-[Poppins] text-text mb-4">Contact Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-primary/5 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                placeholder="+49 30 239 165 67"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-primary/5 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                placeholder="hello@mamis-berlin.de"
              />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-card rounded-[--radius-lg] border border-primary/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-[Poppins] text-text">Opening Hours</h2>
            <button type="button" onClick={addHour} className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors duration-200">
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
                  className="flex-1 px-3 py-2 border border-primary/5 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                />
                {form.hours.length > 1 && (
                  <button type="button" onClick={() => removeHour(i)} className="text-error/60 hover:text-error transition-colors duration-200">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map Address */}
        <div className="bg-card rounded-[--radius-lg] border border-primary/5 shadow-sm p-6">
          <h2 className="text-lg font-semibold font-[Poppins] text-text mb-4">Map</h2>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Map Display Address</label>
            <input
              type="text"
              value={form.map_address}
              onChange={(e) => setForm({ ...form, map_address: e.target.value })}
              className="w-full px-3 py-2 border border-primary/5 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
              placeholder="Oderberger Straße 13, 10435 Berlin"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-[--radius-md] hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 font-medium"
          >
            <Save size={16} />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
