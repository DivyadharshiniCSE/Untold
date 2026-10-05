import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';

export default function StudioLogin() {
  const { signIn } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(passcode);
    if (error) {
      setError(error);
    } else {
      navigate('/studio');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0a0908' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl mb-3" style={{ color: '#e8e2d8' }}>
            The Story Studio
          </h1>
          <p className="font-body text-xs font-light tracking-[0.2em] uppercase text-ivory-500">
            Private archive
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-ivory-400 mb-3">
              Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              className="w-full bg-transparent border-b border-ink-500 py-3 font-body text-sm font-light text-ivory-100 focus:border-gold-500 focus:outline-none transition-colors"
              style={{ color: '#e8e2d8' }}
            />
          </div>

          {error && (
            <p className="text-sm text-burgundy-500 font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-[10px] tracking-[0.3em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entering...' : 'Enter the studio'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
