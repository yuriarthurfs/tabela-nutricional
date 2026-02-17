import { useState } from 'react';
import { LogOut, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || 'Erro ao fazer login');
          return;
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message || 'Erro ao criar conta');
          return;
        }

        setError('');
        alert('Conta criada com sucesso! Você pode fazer login agora.');
        setIsLogin(true);
        setPassword('');
      }

      onAuthSuccess();
    } catch (err) {
      setError('Erro ao processar autenticação');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">
          Rotulagem Nutricional
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isLogin ? 'Entre na sua conta' : 'Crie uma nova conta'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline mr-2" size={16} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Lock className="inline mr-2" size={16} />
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              {isLogin ? 'Criar agora' : 'Fazer login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export async function handleLogout() {
  await supabase.auth.signOut();
}
