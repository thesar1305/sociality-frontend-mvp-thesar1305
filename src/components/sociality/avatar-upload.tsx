/* eslint-disable @next/next/no-img-element */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { updateMyAvatar } from '@/lib/api/profile';
import { validateAvatarFile } from '@/lib/validation/profile';
import type { MyProfile } from '@/types/profile';

type AvatarUploadProps = {
  profile: MyProfile;
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U'
  );
}

export function AvatarUpload({ profile }: AvatarUploadProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const uploadMutation = useMutation({
    mutationFn: updateMyAvatar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['me'],
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      setSuccessMessage('Avatar berhasil diperbarui.');

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    onError: (error) => {
      setFileError(getApiErrorMessage(error));
    },
  });

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setFileError(null);
    setSuccessMessage(null);

    if (!file) {
      return;
    }

    const validationError = validateAvatarFile(file);

    if (validationError) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setFileError(validationError);
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleUpload() {
    if (!selectedFile) {
      return;
    }

    setFileError(null);
    setSuccessMessage(null);
    uploadMutation.mutate(selectedFile);
  }

  const imageUrl = previewUrl ?? profile.avatarUrl;

  return (
    <div className='-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end'>
      <div className='flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted text-3xl font-bold'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Avatar ${profile.name}`}
            className='h-full w-full object-cover'
          />
        ) : (
          <span>{getInitials(profile.name)}</span>
        )}
      </div>

      <div className='space-y-2 pb-1'>
        <input
          ref={inputRef}
          type='file'
          accept='image/png,image/jpeg,image/webp'
          className='sr-only'
          onChange={handleFileChange}
        />

        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={uploadMutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            Pilih foto
          </Button>

          {selectedFile ? (
            <Button
              type='button'
              disabled={uploadMutation.isPending}
              onClick={handleUpload}
            >
              {uploadMutation.isPending ? 'Mengunggah...' : 'Unggah foto'}
            </Button>
          ) : null}
        </div>

        <p className='text-xs text-muted-foreground'>
          PNG, JPG, atau WEBP. Maksimal 5 MB.
        </p>

        {selectedFile ? (
          <p className='text-xs text-muted-foreground'>
            Dipilih: {selectedFile.name}
          </p>
        ) : null}

        {fileError ? (
          <p role='alert' className='text-sm text-destructive'>
            {fileError}
          </p>
        ) : null}

        {successMessage ? (
          <p
            role='status'
            className='text-sm text-emerald-600 dark:text-emerald-400'
          >
            {successMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
