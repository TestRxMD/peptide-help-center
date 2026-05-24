import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  age_range?: string;
  sex?: string;
  weight_kg?: number;
  primary_goal?: string;
  experience?: string;
}

interface AuthContextValue {
  user:        User | null;
  profile:     UserProfile | null;
  loading:     boolean;
  signUp:      (email: string, password: string) => Promise<string | null>;
  signIn:      (email: string, password: string) => Promise<string | null>;
  signOut:     () => Promise<void>;
  saveProfile: (data: Partial<UserProfile>) => Promise<void>;
  showAuthModal: boolean;
  openAuth:    () => void;
  closeAuth:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadProfile = useCallback(async (uid: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    if (data) setProfile(data as UserProfile);
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured';
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const saveProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!supabase || !user) return;
    await supabase.from('profiles').upsert({ id: user.id, ...data, updated_at: new Date().toISOString() });
    setProfile(prev => prev ? { ...prev, ...data } : { id: user.id, ...data });
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUp, signIn, signOut, saveProfile,
      showAuthModal, openAuth: () => setShowAuthModal(true), closeAuth: () => setShowAuthModal(false),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
