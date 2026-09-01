// src/hooks/useAuth.ts

import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import type {
  AuthChangeEvent,
  Session,
  User as SupabaseUser,
} from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: 'email' | 'google' | 'facebook' | 'instagram';
  isAdmin?: boolean;
  adminRole?: string;
}

type AuthProvider =
  | 'google'
  | 'facebook'
  | 'instagram';

/* =========================================================
   Map Supabase Auth + Profile -> App User
========================================================= */

const mapToUser = (
  authUser: SupabaseUser,
  profile?: any | null
): User => {
  const metadata = authUser.user_metadata ?? {};

  const provider =
    profile?.provider ||
    authUser.app_metadata?.provider ||
    metadata.provider ||
    'email';

  return {
    id: authUser.id,

    email:
      authUser.email ||
      profile?.email ||
      '',

    name:
      profile?.name ||
      metadata.name ||
      metadata.full_name ||
      metadata.display_name ||
      authUser.email?.split('@')[0] ||
      'Customer',

    avatar:
      profile?.avatar ||
      metadata.avatar_url ||
      metadata.picture ||
      undefined,

    provider:
      provider === 'google' ||
      provider === 'facebook' ||
      provider === 'instagram'
        ? provider
        : 'email',

    isAdmin:
      profile?.is_admin === true &&
      profile?.admin_status !== 'Inactive',
    adminRole:
      profile?.admin_role || undefined,
  };
};

/* =========================================================
   Auth Hook
========================================================= */

export const useAuth = () => {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  /* =======================================================
     Load Profile
  ======================================================= */

  const loadProfile = useCallback(
    async (
      authUser: SupabaseUser
    ) => {
      try {
        const {
          data: profile,
          error,
        } = await supabase
          .from('profiles')
          .select(
            `
              id,
              email,
              name,
              avatar,
              provider,
              is_admin,
              admin_role,
              admin_status
            `
          )
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) {
          console.warn(
            '[NOTORIOUS.Y2] Profile lookup failed:',
            error.message
          );

          /*
           * Auth is still valid even if the profile lookup
           * temporarily fails.
           */
          setUser(
            mapToUser(
              authUser,
              null
            )
          );

          return;
        }

        setUser(
          mapToUser(
            authUser,
            profile
          )
        );
      } catch (error) {
        console.error(
          '[NOTORIOUS.Y2] Failed to load profile:',
          error
        );

        setUser(
          mapToUser(
            authUser,
            null
          )
        );
      }
    },
    []
  );

  /* =======================================================
     Initial Session
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const initializeAuth =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (!mounted) {
            return;
          }

          if (data.session?.user) {
            await loadProfile(
              data.session.user
            );
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error(
            '[NOTORIOUS.Y2] Failed to restore session:',
            error
          );

          if (mounted) {
            setUser(null);
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    void initializeAuth();

    /* =====================================================
       Auth State Listener

       IMPORTANT:
       Never await Supabase queries directly inside this
       callback. Schedule them asynchronously instead.
    ===================================================== */

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          _event: AuthChangeEvent,
          session: Session | null
        ) => {
          if (!mounted) {
            return;
          }

          if (!session?.user) {
            setUser(null);
            setIsLoading(false);
            return;
          }

          /*
           * DO NOT await this.
           *
           * Supabase Auth may be holding an internal lock
           * while this callback executes.
           */
          window.setTimeout(() => {
            if (!mounted) {
              return;
            }

            void loadProfile(
              session.user
            ).finally(() => {
              if (mounted) {
                setIsLoading(false);
              }
            });
          }, 0);
        }
      );

    return () => {
      mounted = false;

      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  /* =======================================================
     Sign In
  ======================================================= */

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ) => {
      setIsLoading(true);

      try {
        const {
          data,
          error,
        } =
          await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

        if (error) {
          throw error;
        }

        /*
         * Hydrate immediately so the admin icon can appear
         * without waiting for another render.
         */
        if (data.user) {
          await loadProfile(
            data.user
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loadProfile]
  );

  /* =======================================================
     Sign Up
  ======================================================= */

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name: string
    ) => {
      setIsLoading(true);

      try {
        const {
          data,
          error,
        } =
          await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,

            options: {
              data: {
                name: name.trim(),
                provider: 'email',
              },
            },
          });

        if (error) {
          throw error;
        }

        /*
         * If email confirmation is disabled, Supabase returns
         * a session immediately.
         *
         * If confirmation is enabled, there won't be a session
         * yet and the user will need to confirm their email.
         */
        if (
          data.session?.user
        ) {
          await loadProfile(
            data.session.user
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loadProfile]
  );

  /* =======================================================
     OAuth
  ======================================================= */

  const signInWithProvider =
    useCallback(
      async (
        provider: AuthProvider
      ) => {
        setIsLoading(true);

        try {
          /*
           * Supabase does not expose Instagram as a normal
           * OAuth provider. Keep the existing UI compatible
           * by routing Instagram through Facebook.
           */
          const supabaseProvider =
            provider === 'instagram'
              ? 'facebook'
              : provider;

          const {
            error,
          } =
            await supabase.auth.signInWithOAuth({
              provider:
                supabaseProvider,

              options: {
                redirectTo:
                  window.location.origin,
              },
            });

          if (error) {
            throw error;
          }
        } catch (error) {
          setIsLoading(false);
          throw error;
        }
      },
      []
    );

  /* =======================================================
     Sign Out
  ======================================================= */

  const signOut = useCallback(
    async () => {
      setIsLoading(true);

      try {
        const {
          error,
        } =
          await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* =======================================================
     Return
  ======================================================= */

  return {
    user,
    isLoading,

    signIn,
    signUp,
    signInWithProvider,
    signOut,

    isAuthenticated:
      !!user,
  };
};