'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { reelApi, productApi, type Reel } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  GripVertical,
  Instagram,
  Link2,
  Loader2,
  Eye,
  EyeOff,
  Film,
} from 'lucide-react';

interface ProductOption {
  _id: string;
  name: string;
}

const NO_PRODUCT = 'none';

export default function AdminReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState<ProductOption[]>([]);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [deletingReel, setDeletingReel] = useState<Reel | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [productId, setProductId] = useState<string>(NO_PRODUCT);

  // Drag & drop reorder
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    const res = await reelApi.getAllReels({ page, limit: 12, search: search || undefined });
    if (res.error) {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
      setReels([]);
    } else {
      setReels(res.data?.data?.reels ?? []);
      setTotalPages(res.data?.data?.pagination?.totalPages ?? 1);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Products for the "link a product" select
  useEffect(() => {
    productApi.getAllProducts({ limit: 100 }).then((res: any) => {
      const list = res.data?.data?.products ?? [];
      setProducts(list.map((p: any) => ({ _id: p._id, name: p.name })));
    });
  }, []);

  const resetForm = () => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setInstagramUrl('');
    setProductId(NO_PRODUCT);
    setEditingReel(null);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (reel: Reel) => {
    resetForm();
    setEditingReel(reel);
    setInstagramUrl(reel.instagramUrl ?? '');
    setProductId(reel.product?._id ?? NO_PRODUCT);
    setFormOpen(true);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast({ title: 'Invalid file', description: 'Please choose a video file.', variant: 'destructive' });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Videos must be under 50 MB.', variant: 'destructive' });
      return;
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!editingReel && !videoFile) {
      toast({ title: 'Video required', description: 'Please upload a reel video.', variant: 'destructive' });
      return;
    }
    if (instagramUrl && !/^https?:\/\/(www\.)?instagram\.com\/.+/i.test(instagramUrl)) {
      toast({
        title: 'Invalid link',
        description: 'The Instagram link must point to instagram.com.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const payload = {
      instagramUrl: instagramUrl || null,
      product: productId === NO_PRODUCT ? null : productId,
    };

    const res = editingReel
      ? await reelApi.updateReel(editingReel._id, { ...payload, video: videoFile })
      : await reelApi.createReel({ ...payload, video: videoFile as File });

    setSaving(false);

    if (res.error) {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
      return;
    }

    toast({
      title: editingReel ? 'Reel updated' : 'Reel created',
      description: editingReel ? 'Changes saved successfully.' : 'The reel is now live on the site.',
    });
    setFormOpen(false);
    resetForm();
    fetchReels();
  };

  const handleDelete = async () => {
    if (!deletingReel) return;
    setSaving(true);
    const res = await reelApi.deleteReel(deletingReel._id);
    setSaving(false);
    setDeletingReel(null);

    if (res.error) {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Reel deleted', description: 'The reel has been removed.' });
    fetchReels();
  };

  const handleToggle = async (reel: Reel) => {
    // Optimistic update
    setReels((prev) => prev.map((r) => (r._id === reel._id ? { ...r, isActive: !r.isActive } : r)));
    const res = await reelApi.toggleActive(reel._id);
    if (res.error) {
      setReels((prev) => prev.map((r) => (r._id === reel._id ? { ...r, isActive: reel.isActive } : r)));
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    } else {
      toast({ title: res.data?.message ?? 'Updated' });
    }
  };

  // ——— Drag & drop reordering ———
  const handleDrop = async (targetIndex: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    setDragOverIndex(null);
    if (from === null || from === targetIndex) return;

    const next = [...reels];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    setReels(next);

    setReordering(true);
    const res = await reelApi.reorderReels(next.map((r) => r._id));
    setReordering(false);

    if (res.error) {
      toast({ title: 'Reorder failed', description: res.error, variant: 'destructive' });
      fetchReels();
    } else {
      toast({ title: 'Order saved' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reels</h1>
            <p className="text-sm text-gray-500">
              Manage the Instagram-style reels shown on the storefront. Drag cards to reorder.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Upload Reel
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by product or Instagram link…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[9/14] w-full rounded-lg" />
            ))}
          </div>
        ) : reels.length === 0 ? (
          <div className="rounded-lg border border-dashed py-20 text-center">
            <Film className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium text-gray-600">No reels yet</p>
            <p className="mb-4 text-sm text-gray-400">Upload your first reel to bring the storefront to life.</p>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Upload Reel
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {reels.map((reel, index) => (
              <div
                key={reel._id}
                draggable={!reordering}
                onDragStart={() => (dragIndex.current = index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDragLeave={() => setDragOverIndex((i) => (i === index ? null : i))}
                onDrop={() => handleDrop(index)}
                className={`group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all ${
                  dragOverIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''
                } ${!reel.isActive ? 'opacity-60' : ''}`}
              >
                {/* Video preview */}
                <div className="relative aspect-[9/14] bg-gray-100">
                  <video
                    src={reel.video.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-1.5">
                    <span className="flex h-7 w-7 cursor-grab items-center justify-center rounded bg-black/50 text-white">
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <Badge variant={reel.isActive ? 'default' : 'secondary'}>
                      {reel.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-2 p-3">
                  <div className="flex min-h-5 items-center gap-2 text-xs text-gray-500">
                    {reel.instagramUrl && (
                      <a
                        href={reel.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-pink-600"
                      >
                        <Instagram className="h-3.5 w-3.5" /> Instagram
                      </a>
                    )}
                    {reel.product && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <Link2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{reel.product.name}</span>
                      </span>
                    )}
                    {!reel.instagramUrl && !reel.product && <span>No links</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" className="h-8 flex-1" onClick={() => handleToggle(reel)}>
                      {reel.isActive ? (
                        <>
                          <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1.5 h-3.5 w-3.5" /> Show
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => openEdit(reel)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletingReel(reel)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => (!open ? (setFormOpen(false), resetForm()) : null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReel ? 'Edit Reel' : 'Upload Reel'}</DialogTitle>
            <DialogDescription>
              {editingReel
                ? 'Replace the video or update the links.'
                : 'Upload a vertical video. Instagram and product links are optional.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video */}
            <div className="space-y-2">
              <Label>Video {editingReel ? '(leave empty to keep current)' : '*'}</Label>
              <Input type="file" accept="video/*" onChange={handleVideoChange} />
              {(videoPreview || editingReel) && (
                <video
                  src={videoPreview ?? editingReel?.video.url}
                  className="mx-auto aspect-[9/14] w-40 rounded-md bg-gray-100 object-cover"
                  controls
                  muted
                  playsInline
                />
              )}
            </div>

            {/* Instagram URL */}
            <div className="space-y-2">
              <Label>Instagram Reel Link</Label>
              <Input
                placeholder="https://www.instagram.com/reel/…"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
            </div>

            {/* Product link */}
            <div className="space-y-2">
              <Label>Linked Product (optional)</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="No product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PRODUCT}>No product</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => (setFormOpen(false), resetForm())} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingReel ? 'Save Changes' : 'Upload Reel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deletingReel} onOpenChange={(open) => !open && setDeletingReel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this reel?</DialogTitle>
            <DialogDescription>
              The video will be removed from the storefront and from storage. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingReel(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Reel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
