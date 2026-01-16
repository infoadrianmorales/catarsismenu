import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Track if we've already checked the role for current user
  const lastCheckedUserId = useRef<string | null>(null);

  const checkAdminRole = async (userId: string) => {
    // Skip if we already checked this user
    if (lastCheckedUserId.current === userId) {
      return;
    }
    
    lastCheckedUserId.current = userId;
    
    try {
      const { data, error } = await supabase.rpc('is_admin', { _user_id: userId });
      if (error) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(data === true);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
        setRoleLoading(false);
      }

      setLoading(false);
    });

    // Then set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Only check role if user changed
        if (lastCheckedUserId.current !== session.user.id) {
          setRoleLoading(true);
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        }
      } else {
        lastCheckedUserId.current = null;
        setIsAdmin(false);
        setRoleLoading(false);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/admin`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    lastCheckedUserId.current = null;
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    roleLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };
};
