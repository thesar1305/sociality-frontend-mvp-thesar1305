/* eslint-disable @next/next/no-img-element */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/api/client';
import { createPost } from '@/lib/api/posts';
import { useAppDispatch } from '@/lib/store/hooks';
import { showToast } from '@/lib/store/toast-slice';
import {
  POST_CAPTION_MAX_LENGTH,
  validatePostImage,
} from '@/lib/validation/post';
import { cn } from 'cn';

export function CreatePostForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
      ]);

      dispatch(showToast({ message: 'Postingan berhasil dibagikan.' }));
      router.push('/feed');
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  function selectImage(file: File | undefined) {
    setFormError(null);

    if (!file) {
      return;
    }

    const validationError = validatePostImage(file);

    if (validationError) {
      setImage(null);
      setPreviewUrl(null);
      setImageError(validationError);
      return;
    }

    setImageError(null);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    selectImage(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectImage(event.dataTransfer.files?.[0]);
  }

  function removeImage() {
    setImage(null);
    setPreviewUrl(null);
    setImageError(null);
    setFormError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);

    if (!image) {
      setImageError('Pilih gambar sebelum membagikan postingan.');
      return;
    }

    createMutation.mutate({
      image,
      caption,
    });
  }

  const isPending = createMutation.isPending;

  return (
    <section aria-labelledby='create-post-heading' className='space-y-6'>
      <div className='flex items-center gap-3'>
        <Link
          href='/feed'
          prefetch={false}
          aria-label='Kembali ke beranda'
          className='flex size-9 items-center justify-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
        >
          <ArrowLeft className='size-5' aria-hidden='true' />
        </Link>
        <h1 id='create-post-heading' className='text-xl font-bold'>
          Tambah Postingan
        </h1>
      </div>

      <form className='space-y-5' onSubmit={handleSubmit} noValidate>
        <input
          ref={inputRef}
          type='file'
          accept='image/png,image/jpeg,image/webp'
          className='sr-only'
          tabIndex={-1}
          aria-hidden='true'
          onChange={handleImageChange}
        />

        <div className='space-y-2'>
          <Label id='post-photo-label'>Foto</Label>

          {previewUrl ? (
            <div className='space-y-3'>
              <div className='overflow-hidden rounded-xl border border-border bg-muted'>
                <img
                  src={previewUrl}
                  alt='Pratinjau gambar postingan'
                  className='max-h-[28rem] w-full object-contain'
                />
              </div>

              <div className='flex flex-wrap items-center justify-center gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  className='rounded-lg'
                  disabled={isPending}
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus aria-hidden='true' />
                  Ganti gambar
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  className='rounded-lg text-destructive hover:text-destructive'
                  disabled={isPending}
                  onClick={removeImage}
                >
                  <Trash2 aria-hidden='true' />
                  Hapus gambar
                </Button>
              </div>

              {image ? (
                <p className='truncate text-center text-xs text-muted-foreground'>
                  {image.name}
                </p>
              ) : null}
            </div>
          ) : (
            <button
              type='button'
              aria-labelledby='post-photo-label'
              aria-describedby={
                imageError ? 'post-photo-hint post-photo-error' : 'post-photo-hint'
              }
              className={cn(
                'flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 px-6 py-8 text-center transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
                imageError
                  ? 'border-destructive'
                  : isDragging
                    ? 'border-ring bg-muted/60'
                    : 'border-input'
              )}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <span className='flex size-10 items-center justify-center rounded-lg border border-border bg-muted'>
                <Upload className='size-5' aria-hidden='true' />
              </span>
              <span className='text-sm'>
                <span className='font-semibold text-brand-200'>
                  Klik untuk unggah
                </span>{' '}
                atau seret dan lepas
              </span>
              <span
                id='post-photo-hint'
                className='text-xs text-muted-foreground'
              >
                PNG, JPG, atau WEBP (maks. 5 MB)
              </span>
            </button>
          )}

          {imageError ? (
            <p
              id='post-photo-error'
              role='alert'
              className='text-sm text-destructive'
            >
              {imageError}
            </p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='post-caption'>Caption</Label>

          <Textarea
            id='post-caption'
            rows={4}
            maxLength={POST_CAPTION_MAX_LENGTH}
            value={caption}
            placeholder='Tulis caption...'
            disabled={isPending}
            onChange={(event) => setCaption(event.target.value)}
          />

          <p className='text-right text-xs text-muted-foreground'>
            {caption.length}/{POST_CAPTION_MAX_LENGTH}
          </p>
        </div>

        {formError ? (
          <p
            role='alert'
            className='rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'
          >
            {formError}
          </p>
        ) : null}

        <Button
          type='submit'
          className='h-11 w-full rounded-full text-base font-semibold'
          disabled={isPending}
        >
          {isPending ? 'Mengunggah...' : 'Bagikan'}
        </Button>
      </form>
    </section>
  );
}
