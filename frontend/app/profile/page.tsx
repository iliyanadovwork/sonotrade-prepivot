'use client';

import { useState, useEffect } from "react";
import * as stylex from "@stylexjs/stylex";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/api/client";

const styles = stylex.create({
  page: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    display: "flex",
    justifyContent: "center",
    paddingTop: "1.5rem",
    paddingLeft: "1.25rem",
    paddingRight: "1.25rem",
    "@media (max-width: 768px)": {
      paddingTop: "0.5rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
  card: {
    maxWidth: "500px",
    width: "100%",
  },
  header: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#ffffff",
    marginTop: 0,
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
    "@media (max-width: 768px)": {
      fontSize: "2rem",
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#a3a3a3",
  },
  input: {
    padding: "0.5rem 0.75rem",
    fontSize: "0.9375rem",
    color: "#ffffff",
    backgroundColor: "#171717",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.375rem",
    outline: "none",
    transition: "all 0.2s",
    "::placeholder": {
      color: "#7a7a7a",
    },
    ":focus": {
      borderColor: "#ffffff",
      boxShadow: "0 0 0 2px #ffffff",
      outline: "2px solid transparent",
      outlineOffset: "2px",
    },
  },
  emojiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gap: "0.5rem",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: "0.5rem",
    },
    "@media (max-width: 480px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "0.5rem",
    },
  },
  emojiButton: {
    width: "100%",
    aspectRatio: "1",
    fontSize: "1.5rem",
    backgroundColor: "#171717",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ":hover": {
      backgroundColor: "#262626",
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    "@media (max-width: 480px)": {
      fontSize: "1.25rem",
    },
  },
  emojiButtonSelected: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  button: {
    flex: 1,
    padding: "0.5rem 1rem",
    fontSize: "0.9375rem",
    fontWeight: 500,
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "transparent",
    ":active": {
      transform: "scale(0.95)",
    },
  },
  cancelButton: {
    backgroundColor: "#171717",
    color: "#ffffff",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    ":hover": {
      backgroundColor: "#262626",
    },
  },
  saveButton: {
    backgroundColor: "#ffffff",
    color: "#000000",
    fontWeight: 500,
    ":hover": {
      backgroundColor: "#f5f5f5",
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  error: {
    padding: "0.75rem",
    fontSize: "0.875rem",
    color: "#f87171",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  successMsg: {
    padding: "0.75rem",
    fontSize: "0.875rem",
    color: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  uploadSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  imagePreviewContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  imagePreview: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  emojiPreview: {
    width: "80px",
    height: "80px",
    fontSize: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171717",
    borderRadius: "50%",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  fileInputWrapper: {
    flex: 1,
  },
  fileInputLabel: {
    display: "inline-block",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#ffffff",
    backgroundColor: "#171717",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#262626",
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
  },
  fileInput: {
    display: "none",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "0.5rem 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    fontSize: "0.75rem",
    color: "#7a7a7a",
    textTransform: "uppercase",
  },
});

const EMOJI_OPTIONS = ['😀', '😎', '🤩', '🥳', '🤓', '🧐', '🤠', '🥸', '🤡', '👻', '💀', '👽', '🤖', '🎃', '😺', '🐶'];

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, isAuthenticated, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    setError('');
    setUploading(true);

    try {
      const result = await apiClient.uploadProfilePicture(file);

      if (result.success && result.url) {
        setProfilePicture(result.url);
      } else {
        setError(result.error || 'Failed to upload image');
        setImagePreview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedUsername = username.trim();

    if (trimmedUsername) {
      if (trimmedUsername !== trimmedUsername.toLowerCase()) {
        setError('Username must be lowercase only');
        return;
      }

      const usernameRegex = /^[a-z0-9_-]+$/;
      if (!usernameRegex.test(trimmedUsername)) {
        setError('Username can only contain lowercase letters, numbers, underscores, and hyphens');
        return;
      }

      if (trimmedUsername.length > 50) {
        setError('Username must be 50 characters or less');
        return;
      }
    }

    setLoading(true);

    try {
      const result = await apiClient.updateProfile({
        username: trimmedUsername,
        profilePicture: profilePicture.trim(),
      });

      if (result.success) {
        setSuccess('Profile updated successfully!');
        await refreshUser();
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.card)}>
        <h2 {...stylex.props(styles.header)}>Edit Profile</h2>

        <form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
          <div {...stylex.props(styles.field)}>
            <label {...stylex.props(styles.label)}>Username</label>
            <input
              {...stylex.props(styles.input)}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Enter your username"
              maxLength={50}
            />
            <p style={{ fontSize: '0.75rem', color: '#7a7a7a', marginTop: '0.25rem' }}>
              Lowercase letters, numbers, underscores, and hyphens only
            </p>
          </div>

          <div {...stylex.props(styles.field)}>
            <label {...stylex.props(styles.label)}>Profile Picture</label>

            <div {...stylex.props(styles.uploadSection)}>
              <div {...stylex.props(styles.imagePreviewContainer)}>
                {imagePreview || (profilePicture && !EMOJI_OPTIONS.includes(profilePicture)) ? (
                  <img
                    {...stylex.props(styles.imagePreview)}
                    src={imagePreview || profilePicture}
                    alt="Profile preview"
                  />
                ) : profilePicture && EMOJI_OPTIONS.includes(profilePicture) ? (
                  <div {...stylex.props(styles.emojiPreview)}>
                    {profilePicture}
                  </div>
                ) : (
                  <div {...stylex.props(styles.emojiPreview)}>
                    ?
                  </div>
                )}

                <div {...stylex.props(styles.fileInputWrapper)}>
                  <label {...stylex.props(styles.fileInputLabel)}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                      {...stylex.props(styles.fileInput)}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading || loading}
                    />
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#7a7a7a', marginTop: '0.5rem' }}>
                    Max 5MB • JPG, PNG, GIF
                  </p>
                </div>
              </div>

              <div {...stylex.props(styles.divider)}>
                <div {...stylex.props(styles.dividerLine)} />
                <span {...stylex.props(styles.dividerText)}>or choose emoji</span>
                <div {...stylex.props(styles.dividerLine)} />
              </div>

              <div {...stylex.props(styles.emojiGrid)}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    {...stylex.props(
                      styles.emojiButton,
                      profilePicture === emoji && styles.emojiButtonSelected
                    )}
                    onClick={() => {
                      setProfilePicture(emoji);
                      setImagePreview(null);
                    }}
                    disabled={uploading || loading}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <div {...stylex.props(styles.error)}>{error}</div>}
          {success && <div {...stylex.props(styles.successMsg)}>{success}</div>}

          <div {...stylex.props(styles.actions)}>
            <button
              type="button"
              {...stylex.props(styles.button, styles.cancelButton)}
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              {...stylex.props(styles.button, styles.saveButton)}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
