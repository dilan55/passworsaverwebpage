import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Lock, Key, Save, LogIn, LogOut, UserPlus } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

interface SavedPassword {
  id: string;
  account_name: string;
  password: string;
  created_at: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([]);
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
      if (user) {
        fetchSavedPasswords();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSavedPasswords();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSavedPasswords = async () => {
    const { data, error } = await supabase
      .from('saved_passwords')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved passwords:', error);
      return;
    }

    setSavedPasswords(data);
  };

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = charset;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    let result = '';
    for (let i = 0; i < passwordLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setGeneratedPassword(result);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) console.error('Error signing up:', error.message);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) console.error('Error signing in:', error.message);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
    setSavedPasswords([]);
  };

  const savePassword = async () => {
    if (!accountName || !generatedPassword) return;

    const { error } = await supabase
      .from('saved_passwords')
      .insert([
        {
          account_name: accountName,
          password: generatedPassword,
        },
      ]);

    if (error) {
      console.error('Error saving password:', error);
      return;
    }

    fetchSavedPasswords();
    setAccountName('');
    setGeneratedPassword('');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Lock className="w-8 h-8" />
              Password Generator
            </h1>
            {user ? (
              <div className="flex items-center gap-4">
                <span>{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <form onSubmit={handleSignIn} className="flex gap-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUp}
                    type="button"
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </button>
                </form>
              </div>
            )}
          </div>

          {user && (
            <>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2">
                      <span>Length:</span>
                      <input
                        type="number"
                        min="8"
                        max="32"
                        value={passwordLength}
                        onChange={(e) => setPasswordLength(Number(e.target.value))}
                        className="border rounded px-3 py-2 w-20"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeNumbers}
                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                      />
                      <span>Include Numbers</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeSymbols}
                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                      />
                      <span>Include Symbols</span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={generatePassword}
                      className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600"
                    >
                      <Key className="w-5 h-5" />
                      Generate Password
                    </button>
                  </div>

                  {generatedPassword && (
                    <div className="mt-6 space-y-4">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={generatedPassword}
                          readOnly
                          className="flex-1 border rounded px-4 py-2 bg-gray-50"
                        />
                        <input
                          type="text"
                          placeholder="Account Name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="border rounded px-4 py-2"
                        />
                        <button
                          onClick={savePassword}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          <Save className="w-4 h-4" />
                          Save Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {savedPasswords.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Saved Passwords</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-4">
                        {savedPasswords.map((saved) => (
                          <div
                            key={saved.id}
                            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
                          >
                            <div>
                              <h3 className="font-semibold">{saved.account_name}</h3>
                              <p className="text-gray-600 font-mono">{saved.password}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(saved.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;