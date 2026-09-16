'use client';

import { useState, FormEvent } from 'react';
import * as stylex from '@stylexjs/stylex';
import { STButton } from '../STButton';
import { useAuth } from '@/lib/context/AuthContext';

const styles = stylex.create({
  card: {
    width: '100%',
    maxWidth: '28rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#000000',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    paddingTop: '1.5rem',
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    paddingBottom: '1rem',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/monogram.png')",
    backgroundRepeat: 'repeat',
    backgroundSize: '600px 600px',
    backgroundPosition: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '-10px',
    height: '25%',
    backgroundImage: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.5) 50%, #000000 100%)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 700,
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    zIndex: 10,
    margin: 0,
  },
  description: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#7a7a7a',
    position: 'relative',
    zIndex: 10,
    margin: 0,
    '@media (min-width: 768px)': {
      fontSize: '0.875rem',
    },
  },
  content: {
    padding: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputWrap: {
    display: 'block',
  },
  input: {
    width: '100%',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    backgroundColor: '#171717',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: 'white',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    boxSizing: 'border-box',
    ':focus': {
      outline: 'none',
      boxShadow: '0 0 0 2px white',
      borderColor: 'white',
    },
    '::placeholder': {
      color: '#7a7a7a',
    },
  },
  errorBox: {
    padding: '0.75rem',
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(127, 29, 29, 0.5)',
    borderRadius: '6px',
  },
  errorText: {
    fontSize: '0.875rem',
    color: '#f87171',
    margin: 0,
  },
  switchWrap: {
    textAlign: 'center',
  },
  switchText: {
    fontSize: '0.875rem',
    color: '#7a7a7a',
    margin: 0,
  },
  switchButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: 'transparent',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    color: 'white',
    cursor: 'pointer',
    textDecoration: 'underline',
    ':hover': {
      color: '#a3a3a3',
    },
  },
});

interface EmailFormProps {
  onSuccess: (email: string) => void;
  mode?: 'login' | 'signup';
  onSwitchMode?: () => void;
}

export function EmailForm({ onSuccess, mode = 'login', onSwitchMode }: EmailFormProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendVerificationCode } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await sendVerificationCode(email, mode === 'signup' && username ? username : undefined);
      onSuccess(email);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div {...stylex.props(styles.card)}>
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.headerOverlay)} />
        <h3 {...stylex.props(styles.title)}>
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </h3>
        <p {...stylex.props(styles.description)}>
          Enter your {mode === 'signup' ? 'details' : 'email'} to receive a verification code
        </p>
      </div>
      <div {...stylex.props(styles.content)}>
        <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
          {mode === 'signup' && (
            <div {...stylex.props(styles.inputWrap)}>
              <input
                id="username"
                type="text"
                placeholder="Username (optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                {...stylex.props(styles.input)}
              />
            </div>
          )}

          <div {...stylex.props(styles.inputWrap)}>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...stylex.props(styles.input)}
            />
          </div>

          {error && (
            <div {...stylex.props(styles.errorBox)} role="alert">
              <p {...stylex.props(styles.errorText)}>{error}</p>
            </div>
          )}

          <STButton
            type="submit"
            variant="secondary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Code'}
          </STButton>

          {onSwitchMode && (
            <div {...stylex.props(styles.switchWrap)}>
              <p {...stylex.props(styles.switchText)}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  {...stylex.props(styles.switchButton)}
                  onClick={onSwitchMode}
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
