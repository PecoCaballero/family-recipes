'use client';

import {
  Avatar,
  Badge,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  type AvatarProps,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import UploadIcon from '@mui/icons-material/Upload';
import { useRef, useState, type ChangeEvent } from 'react';
import { resolveAvatarUrl } from '@/app/_utils/avatarUrl';

interface AvatarUploadProps extends Omit<AvatarProps, 'src' | 'children'> {
  src?: string | null;
  fallback: React.ReactNode;
  uploadLabel: string;
  deleteLabel: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function AvatarUpload({
  src,
  fallback,
  uploadLabel,
  deleteLabel,
  onUpload,
  onRemove,
  sx,
  ...props
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(src ?? null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const displaySrc = previewUrl && !previewUrl.startsWith('blob:')
    ? resolveAvatarUrl(previewUrl)
    : previewUrl || undefined;
  const hasAvatar = !!previewUrl;
  const menuOpen = Boolean(menuAnchor);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploading(true);

    try {
      await onUpload(file);
    } catch {
      setPreviewUrl(null);
    } finally {
      URL.revokeObjectURL(url);
      setUploading(false);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = async () => {
    setMenuAnchor(null);
    setPreviewUrl(null);
    setUploading(true);
    try {
      await onRemove();
    } catch {
      // keep preview if remove fails
    } finally {
      setUploading(false);
    }
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleUploadClick = () => {
    handleMenuClose();
    inputRef.current?.click();
  };

  return (
    <>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          uploading ? (
            <CircularProgress size={24} />
          ) : hasAvatar ? (
            <IconButton
              size="small"
              sx={{
                bgcolor: 'grey.600',
                color: 'white',
                '&:hover': { bgcolor: 'grey.700' },
              }}
              onClick={handleMenuOpen}
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          ) : (
            <IconButton
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
              onClick={() => inputRef.current?.click()}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          )
        }
      >
        <Avatar
          src={displaySrc}
          sx={{
            width: 80,
            height: 80,
            fontSize: '2rem',
            backgroundColor: 'primary.main',
            ...sx,
          }}
          {...props}
        >
          {fallback}
        </Avatar>
      </Badge>

      <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleUploadClick}>
          <ListItemIcon>
            <UploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{uploadLabel}</ListItemText>
        </MenuItem>
        {hasAvatar && (
          <MenuItem onClick={handleRemove}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{deleteLabel}</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
    </>
  );
}
