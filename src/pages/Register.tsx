/**
 * 📝 Register Page - Registratiepagina
 * Strona rejestracji nowego użytkownika
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, GoogleLogo, EnvelopeSimple, Lock, User, CheckCircle, Envelope, Buildings } from '@phosphor-icons/react';
import { toast } from 'sonner';

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
      toast.error('Vul alle velden in');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 6) {
      toast.error('Wachtwoord moet minimaal 6 tekens bevatten');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      // Toon bevestigingsbanner in plaats van redirecten
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Animated Background - Ocean Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-500 to-purple-700 animate-gradient"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-cyan-300/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo en Header - Met Animatie */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
            <img 
              src="/messu-bouw-logo.jpg" 
              alt="Messu Bouw Logo" 
              className="relative w-32 h-32 object-contain rounded-2xl shadow-2xl border-4 border-white/30 backdrop-blur-sm"
            />
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <Buildings size={40} weight="duotone" className="text-white" />
            <h1 className="text-4xl font-black text-white drop-shadow-2xl">
              Account Aanmaken
            </h1>
          </div>
          <p className="text-white/90 text-lg font-medium drop-shadow-lg">
            Begin uw 30 dagen gratis proefperiode
          </p>
        </div>

        {/* E-mail Bevestiging Success Banner */}
        {showEmailConfirmation && (
          <div className="mb-6 p-6 bg-white/95 backdrop-blur-xl border-2 border-green-500 rounded-3xl animate-fade-in shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle size={40} weight="fill" className="text-green-600 animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-green-900 mb-3">
                  ✅ Account succesvol aangemaakt!
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2 font-semibold">
                    <Envelope size={18} weight="fill" />
                    <span>Controleer uw inbox: <strong className="text-blue-600">{email}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    📧 Klik op de activeringslink om uw account te bevestigen
                  </p>
                  <p className="flex items-center gap-2">
                    ⏰ Link geldig voor <strong>24 uur</strong>
                  </p>
                  <p className="mt-3 pt-3 border-t-2 border-green-200 flex items-start gap-2">
                    <span>💡</span>
                    <span><strong>E-mail niet ontvangen?</strong> Controleer uw SPAM/Ongewenste e-mail map</span>
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-5 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                >
                  Ga naar Inloggen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registratie Kaart - Glassmorphism */}
        {!showEmailConfirmation && (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* E-mail */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                E-mailadres
              </label>
              <div className="relative group">
                <EnvelopeSimple className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-600 transition-colors" size={22} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Wachtwoord */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Wachtwoord
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-600 transition-colors" size={22} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimaal 6 tekens"
                  className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                >
                  {showPassword ? <EyeSlash size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Bevestig Wachtwoord */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Bevestig Wachtwoord
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-600 transition-colors" size={22} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Herhaal wachtwoord"
                  className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeSlash size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Voorwaarden */}
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
              Door te registreren accepteert u onze{' '}
              <a href="#" className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline">
                Gebruiksvoorwaarden
              </a>{' '}
              en{' '}
              <a href="#" className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline">
                Privacybeleid
              </a>
            </div>

            {/* Registreren Button - Gradient met Animatie */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-cyan-600/40 hover:shadow-2xl hover:shadow-cyan-700/50 transform hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Account aanmaken...
                </span>
              ) : (
                'Account Aanmaken'
              )}
            </button>
          </form>

          {/* Inloggen Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Heeft u al een account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline transition-all"
              disabled={loading}
            >
              Inloggen
            </button>
          </div>
        </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-white/80 drop-shadow font-medium">
          © 2025 Messu Bouw. Alle rechten voorbehouden.
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}
