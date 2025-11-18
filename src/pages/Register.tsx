/**
 * 📝 Register Page
 * Strona rejestracji nowego użytkownika
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, GoogleLogo, EnvelopeSimple, Lock, User, CheckCircle, Envelope } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { DEMO_MODE } from '@/config/firebase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error('Wypełnij wszystkie pola');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Hasła nie są identyczne');
      return;
    }

    if (password.length < 6) {
      toast.error('Hasło musi mieć minimum 6 znaków');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      // Pokazujemy informacyjny banner zamiast przekierowania
      setShowEmailConfirmation(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo i Nazwa */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="/messu-bouw-logo.jpg" 
              alt="Messu Bouw Logo" 
              className="w-32 h-32 object-contain rounded-2xl shadow-2xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Utwórz konto
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Rozpocznij 30-dniowy bezpłatny okres próbny
          </p>
        </div>

        {/* Email Confirmation Success Banner */}
        {showEmailConfirmation && (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-xl animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle size={32} weight="fill" className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                  ✅ Konto utworzone pomyślnie!
                </h3>
                <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                  <p className="flex items-center gap-2">
                    <Envelope size={16} weight="fill" />
                    <span>Sprawdź swoją skrzynkę pocztową: <strong>{email}</strong></span>
                  </p>
                  <p>📧 Kliknij w link aktywacyjny, aby potwierdzić konto</p>
                  <p>⏰ Link ważny przez <strong>24 godziny</strong></p>
                  <p className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                    💡 <strong>Nie widzisz emaila?</strong> Sprawdź folder SPAM/Wiadomości-śmieci
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Przejdź do logowania
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEMO MODE Info */}
        {DEMO_MODE && !showEmailConfirmation && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
              <strong>🔧 Tryb Demo</strong> - Możesz użyć dowolnego emaila i hasła
            </p>
          </div>
        )}

        {/* Karta Rejestracji */}
        {!showEmailConfirmation && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={DEMO_MODE ? "demo@messubouw.com" : "twoj@email.com"}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 znaków"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Potwierdź hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Powtórz hasło"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Rejestrując się akceptujesz nasze{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Warunki Użytkowania
              </a>{' '}
              i{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Politykę Prywatności
              </a>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {loading ? 'Tworzenie konta...' : 'Utwórz konto'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Masz już konto?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
              disabled={loading}
            >
              Zaloguj się
            </button>
          </div>
        </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          © 2025 Messu Bouw. Wszystkie prawa zastrzeżone.
        </p>
      </div>
    </div>
  );
}
