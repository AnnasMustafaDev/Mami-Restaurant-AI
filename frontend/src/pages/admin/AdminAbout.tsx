import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminGetConfig, adminUpdateConfig } from '../../services/api';

interface Value {
  icon: string;
  title: string;
  desc: string;
}

interface Milestone {
  year: string;
  title: string;
  desc: string;
}

interface Chef {
  label: string;
  name: string;
  paragraph1: string;
  paragraph2: string;
  image_url: string;
}

interface AboutContent {
  hero_subtitle: string;
  hero_title: string;
  hero_description: string;
  story_label: string;
  story_title: string;
  story_paragraphs: string[];
  story_image_url: string;
  values: Value[];
  milestones: Milestone[];
  chef: Chef;
}

const defaultAbout: AboutContent = {
  hero_subtitle: '',
  hero_title: '',
  hero_description: '',
  story_label: '',
  story_title: '',
  story_paragraphs: [''],
  story_image_url: '',
  values: [],
  milestones: [],
  chef: { label: '', name: '', paragraph1: '', paragraph2: '', image_url: '' },
};

const iconOptions = ['Heart', 'Leaf', 'Users', 'Award', 'Star', 'Wine', 'ChefHat', 'Flame', 'Globe', 'Music'];

export default function AdminAbout() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AboutContent>(defaultAbout);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-config', 'about'],
    queryFn: () => adminGetConfig('about'),
    retry: 1,
  });

  useEffect(() => {
    if (data?.value) {
      setForm({ ...defaultAbout, ...data.value });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (content: AboutContent) => adminUpdateConfig('about', content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-config', 'about'] });
      toast.success('About section updated');
    },
    onError: () => toast.error('Failed to update about section'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const updateValue = (index: number, field: keyof Value, val: string) => {
    setForm((prev) => ({
      ...prev,
      values: prev.values.map((v, i) => (i === index ? { ...v, [field]: val } : v)),
    }));
  };

  const addValue = () => {
    setForm((prev) => ({
      ...prev,
      values: [...prev.values, { icon: 'Heart', title: '', desc: '' }],
    }));
  };

  const removeValue = (index: number) => {
    setForm((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  const updateMilestone = (index: number, field: keyof Milestone, val: string) => {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => (i === index ? { ...m, [field]: val } : m)),
    }));
  };

  const addMilestone = () => {
    setForm((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { year: '', title: '', desc: '' }],
    }));
  };

  const removeMilestone = (index: number) => {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const updateParagraph = (index: number, val: string) => {
    setForm((prev) => ({
      ...prev,
      story_paragraphs: prev.story_paragraphs.map((p, i) => (i === index ? val : p)),
    }));
  };

  const addParagraph = () => {
    setForm((prev) => ({
      ...prev,
      story_paragraphs: [...prev.story_paragraphs, ''],
    }));
  };

  const removeParagraph = (index: number) => {
    setForm((prev) => ({
      ...prev,
      story_paragraphs: prev.story_paragraphs.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">About Section</h1>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">About Section</h1>
        <div className="text-center py-8">
          <p className="text-red-600 text-sm font-medium">Failed to load about content</p>
          <button onClick={() => refetch()} className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Section</h1>
          <p className="text-sm text-gray-500 mt-1">Edit the public about page content</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Hero Section */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.hero_subtitle}
                onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g. Seit 2019 — Berlin Prenzlauer Berg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.hero_title}
                onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={form.hero_description}
                onChange={(e) => setForm({ ...form, hero_description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Story Section</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={form.story_label}
                onChange={(e) => setForm({ ...form, story_label: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.story_title}
                onChange={(e) => setForm({ ...form, story_title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Story Image URL</label>
              <input
                type="text"
                value={form.story_image_url}
                onChange={(e) => setForm({ ...form, story_image_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="https://..."
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Paragraphs</label>
                <button type="button" onClick={addParagraph} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                  <Plus size={14} /> Add paragraph
                </button>
              </div>
              <div className="space-y-2">
                {form.story_paragraphs.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <textarea
                      rows={3}
                      value={p}
                      onChange={(e) => updateParagraph(i, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    />
                    {form.story_paragraphs.length > 1 && (
                      <button type="button" onClick={() => removeParagraph(i)} className="text-red-400 hover:text-red-600 self-start mt-2">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Values</h2>
            <button type="button" onClick={addValue} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
              <Plus size={16} /> Add value
            </button>
          </div>
          <div className="space-y-4">
            {form.values.map((v, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={v.icon}
                    onChange={(e) => updateValue(i, 'icon', e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={v.title}
                    onChange={(e) => updateValue(i, 'title', e.target.value)}
                    placeholder="Title"
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="text"
                    value={v.desc}
                    onChange={(e) => updateValue(i, 'desc', e.target.value)}
                    placeholder="Description"
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <button type="button" onClick={() => removeValue(i)} className="text-red-400 hover:text-red-600 mt-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {form.values.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No values added yet.</p>
            )}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
            <button type="button" onClick={addMilestone} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
              <Plus size={16} /> Add milestone
            </button>
          </div>
          <div className="space-y-4">
            {form.milestones.map((m, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={m.year}
                    onChange={(e) => updateMilestone(i, 'year', e.target.value)}
                    placeholder="Year"
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                    placeholder="Title"
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="text"
                    value={m.desc}
                    onChange={(e) => updateMilestone(i, 'desc', e.target.value)}
                    placeholder="Description"
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <button type="button" onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-600 mt-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {form.milestones.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No milestones added yet.</p>
            )}
          </div>
        </div>

        {/* Chef Section */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chef / Owner Section</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={form.chef.label}
                  onChange={(e) => setForm({ ...form, chef: { ...form.chef, label: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g. Unsere Gastgeber"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.chef.name}
                  onChange={(e) => setForm({ ...form, chef: { ...form.chef, name: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={form.chef.image_url}
                onChange={(e) => setForm({ ...form, chef: { ...form.chef, image_url: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 1</label>
              <textarea
                rows={3}
                value={form.chef.paragraph1}
                onChange={(e) => setForm({ ...form, chef: { ...form.chef, paragraph1: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 2</label>
              <textarea
                rows={3}
                value={form.chef.paragraph2}
                onChange={(e) => setForm({ ...form, chef: { ...form.chef, paragraph2: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>
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
