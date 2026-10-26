/* eslint-disable @next/next/no-img-element */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { createPost } from '@/lib/api/posts';
import {
  POST_CAPTION_MAX_LENGTH,
  validatePostImage,
} from '@/lib/validation/post';

type CreatePostFormProps = {
  onCreated?: () => void;
};

export function CreatePostForm({ onCreated }: CreatePostFormProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setImage(null);
      setPreviewUrl(null);
      setCaption('');
      setFormError(null);
      setSuccessMessage('Postingan berhasil dibuat.');

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      await queryClient.invalidateQueries({
        queryKey: ['posts'],
      });

      onCreated?.();
    },
    onError: (error) => {
      setSuccessMessage(null);
      setFormError(getApiErrorMessage(error));
    },
  });

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedImage = event.target.files?.[0];

    setFormError(null);
    setSuccessMessage(null);

    if (!selectedImage) {
      return;
    }

    const validationError = validatePostImage(selectedImage);

    if (validationError) {
      setImage(null);
      setPreviewUrl(null);
      setFormError(validationError);
      event.target.value = '';
      return;
    }

    setImage(selectedImage);
    setPreviewUrl(URL.createObjectURL(selectedImage));
  }

  function removeImage() {
    setImage(null);
    setPreviewUrl(null);
    setFormError(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);
    setSuccessMessage(null);

    if (!image) {
      setFormError('Pilih gambar sebelum membuat postingan.');
      return;
    }

    createMutation.mutate({
      image,
      caption,
    });
  }

  return (
    <section
      id='create-post'
      className='scroll-mt-24 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm'
    >
      <div>
        <h2 className='text-xl font-bold'>Buat postingan</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Bagikan gambar dan cerita kepada komunitas.
        </p>
      </div>

      <form className='mt-5 space-y-4' onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type='file'
          accept='image/png,image/jpeg,image/webp'
          className='sr-only'
          onChange={handleImageChange}
        />

        {previewUrl ? (
          <div className='overflow-hidden rounded-2xl border bg-muted'>
            <img
              src={previewUrl}
              alt='Pratinjau gambar postingan'
              className='max-h-[32rem] w-full object-contain'
            />
          </div>
        ) : (
          <button
            type='button'
            className='flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 text-center transition hover:bg-muted/60'
            onClick={() => inputRef.current?.click()}
          >
            <span className='font-semibold'>Pilih gambar</span>
            <span className='mt-2 text-sm text-muted-foreground'>
              PNG, JPG, atau WEBP maksimal 5 MB
            </span>
          </button>
        )}

        {image ? (
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <p className='min-w-0 truncate text-sm text-muted-foreground'>
              {image.name}
            </p>

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={createMutation.isPending}
                onClick={() => inputRef.current?.click()}
              >
                Ganti
              </Button>

              <Button
                type='button'
                variant='outline'
                disabled={createMutation.isPending}
                onClick={removeImage}
              >
                Hapus
              </Button>
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor='post-caption' className='mb-2 block font-medium'>
            Caption
          </label>

          <textarea
            id='post-caption'
            rows={4}
            maxLength={POST_CAPTION_MAX_LENGTH}
            value={caption}
            placeholder='Ceritakan sesuatu...'
            className='w-full resize-y rounded-xl border bg-background px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
            onChange={(event) => {
              setCaption(event.target.value);
              setSuccessMessage(null);
            }}
          />

          <p className='mt-1 text-right text-xs text-muted-foreground'>
            {caption.length}/{POST_CAPTION_MAX_LENGTH}
          </p>
        </div>

        {formError ? (
          <p
            role='alert'
            className='rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'
          >
            {formError}
          </p>
        ) : null}

        {successMessage ? (
          <p
            role='status'
            className='rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400'
          >
            {successMessage}
          </p>
        ) : null}

        <Button
          type='submit'
          className='w-full'
          disabled={!image || createMutation.isPending}
        >
          {createMutation.isPending ? 'Mengunggah...' : 'Buat postingan'}
        </Button>
      </form>
    </section>
  );
}
