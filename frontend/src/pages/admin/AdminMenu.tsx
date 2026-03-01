import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, RefreshCw, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  adminGetAllMenuItems,
  adminCreateMenuItem,
  adminUpdateMenuItem,
  adminDeleteMenuItem,
} from '../../services/api';

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  dietary_tags: string[];
  image_url: string | null;
  is_available: boolean;
  is_special: boolean;
  created_at: string;
}

const categories = [
  { value: '', label: 'All categories' },
  { value: 'nebenbei', label: 'Nebenbei' },
  { value: 'kalt', label: 'Kalt' },
  { value: 'warm', label: 'Warm' },
  { value: 'suess', label: 'Süß' },
  { value: 'wine', label: 'Wine' },
];

const tagOptions = ['vegan', 'vegetarian', 'gluten-free'];

const emptyForm = {
  name: '',
  description: '',
  category: 'warm',
  price: 0,
  dietary_tags: [] as string[],
  image_url: '',
  is_available: true,
  is_special: false,
};

export default function AdminMenu() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: items = [], isLoading, isError, error, refetch } = useQuery<MenuItem[]>({
    queryKey: ['admin-menu'],
    queryFn: adminGetAllMenuItems,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: adminCreateMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      toast.success('Menu item created');
      closeForm();
    },
    onError: () => toast.error('Failed to create menu item'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      adminUpdateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      toast.success('Menu item updated');
      closeForm();
    },
    onError: () => toast.error('Failed to update menu item'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      toast.success('Menu item deleted');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete menu item'),
  });

  const filtered = categoryFilter
    ? items.filter((i) => i.category === categoryFilter)
    : items;

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category || 'warm',
      price: item.price,
      dietary_tags: item.dietary_tags || [],
      image_url: item.image_url || '',
      is_available: item.is_available,
      is_special: item.is_special,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || undefined,
      category: form.category,
      price: form.price,
      dietary_tags: form.dietary_tags,
      image_url: form.image_url || undefined,
      is_available: form.is_available,
      is_special: form.is_special,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter((t) => t !== tag)
        : [...prev.dietary_tags, tag],
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text font-[Poppins]">Menu Management</h1>
          <p className="text-sm text-text-secondary mt-1">{filtered.length} item(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-[--radius-md] hover:bg-primary-dark transition-colors duration-200"
          >
            <Plus size={16} />
            Add Item
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-primary/10 rounded-[--radius-md] hover:bg-bg transition-colors duration-200"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 border border-primary/10 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-[--radius-lg] border border-primary/10 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text font-[Poppins]">
              {editingId ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <button onClick={closeForm} className="text-text-muted hover:text-text-secondary transition-colors duration-200">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-primary/10 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Price *</label>
                <input
                  type="number"
                  required
                  step="0.5"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-primary/10 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-primary/10 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-primary/10 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {categories.slice(1).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-primary/10 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Dietary Tags</label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                      form.dietary_tags.includes(tag)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-text-secondary border-primary/10 hover:border-primary/20'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-text">Available</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_special}
                  onChange={(e) => setForm({ ...form, is_special: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-text">Special</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 text-sm border border-primary/10 rounded-[--radius-md] hover:bg-bg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-sm bg-primary text-white rounded-[--radius-md] hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingId
                    ? 'Update Item'
                    : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-[--radius-lg] border border-primary/10 shadow-sm overflow-hidden">
        {isError ? (
          <div className="p-8 text-center">
            <p className="text-error text-sm font-medium">Failed to load menu items</p>
            <p className="text-text-secondary text-xs mt-1">{(error as any)?.response?.data?.detail || (error as Error)?.message || 'Check that the backend server is running'}</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-primary hover:text-primary-dark font-medium transition-colors duration-200">Try again</button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-text-secondary text-sm">Loading menu items...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">No menu items found.</div>
        ) : (
          <table className="admin-table w-full text-sm">
            <thead>
              <tr className="bg-bg border-b border-primary/10">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Category</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Price</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Tags</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-primary/10 last:border-0 hover:bg-bg transition-colors duration-200">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-text-muted truncate max-w-xs">{item.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize text-text">{item.category || '—'}</td>
                  <td className="px-4 py-3 text-text">{item.price.toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.dietary_tags?.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 bg-success/10 text-success rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.is_available ? (
                        <span className="px-2 py-0.5 bg-success/10 text-success rounded-full text-xs font-medium">Available</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-error/10 text-error rounded-full text-xs font-medium">Unavailable</span>
                      )}
                      {item.is_special && (
                        <span className="px-2 py-0.5 bg-accent/15 text-accent rounded-full text-xs font-medium">Special</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            id: item.id,
                            data: { is_available: !item.is_available },
                          })
                        }
                        className={`p-1.5 rounded transition-colors duration-200 ${
                          item.is_available
                            ? 'text-success hover:bg-success/5'
                            : 'text-text-muted hover:bg-bg'
                        }`}
                        title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded transition-colors duration-200"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      {deleteConfirm === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="px-2 py-1 text-xs bg-error text-white rounded hover:opacity-90 transition-colors duration-200"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs border border-primary/10 rounded hover:bg-bg transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-1.5 text-text-muted hover:text-error hover:bg-error/5 rounded transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
