import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginSchema, registerSchema } from '@yourvivac/validation';
import type { LoginRequest, RegisterRequest } from '@yourvivac/types';
import { Field, Icon, Logo } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { useAuthStore } from '@/stores/authStore';
import { isFirebaseConfigured, signInWithGoogle } from '@/lib/firebase';

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 36.4 44 31 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

type Mode = 'login' | 'register';

export function LoginScreen() {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);

  const loginForm = useForm<LoginRequest>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterRequest>({ resolver: zodResolver(registerSchema) });

  if (user) return <Navigate to="/" replace />;

  async function onLogin(values: LoginRequest) {
    setBusy(true);
    try {
      const { user: u, accessToken } = await api.auth.login(values);
      setAuth(u, accessToken);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(errMsg(err, 'No se pudo iniciar sesión'));
    } finally {
      setBusy(false);
    }
  }

  async function onRegister(values: RegisterRequest) {
    setBusy(true);
    try {
      const { user: u, accessToken } = await api.auth.register(values);
      setAuth(u, accessToken);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(errMsg(err, 'No se pudo crear la cuenta'));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    if (!isFirebaseConfigured) {
      toast.error('Google no está configurado en este entorno');
      return;
    }
    setBusy(true);
    try {
      const idToken = await signInWithGoogle();
      const { user: u, accessToken } = await api.auth.google({ idToken });
      setAuth(u, accessToken);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(errMsg(err, 'No se pudo entrar con Google'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden lg:flex-row">
      {/* Portada */}
      <div className="imgslot topo relative h-[34%] w-full items-start lg:h-full lg:w-1/2">
        <span className="imgslot__tag m-3.5">foto · vivac nocturno</span>
        <div className="absolute left-7 top-8 lg:top-10">
          <Logo size={20} />
        </div>
        {/* Difuminado hacia el contenido (como la máscara del diseño) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--bg)] lg:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-transparent to-[var(--bg)] lg:block" />
      </div>

      {/* Contenido */}
      <div className="relative flex flex-1 flex-col justify-center px-7 pb-8 pt-6 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="eyebrow mb-3.5">El campamento base de tus salidas</div>
          <h1 className="text-[34px] leading-[0.98] tracking-[-0.02em] lg:text-[44px]">
            Planifica tu vivac.
            <br />
            <span className="text-accent">Reúne</span> a tu gente.
          </h1>
          <p className="muted mt-3.5 max-w-sm text-[15px]">
            Crea la excursión, invita a tus amigos y montad juntos el tablero: rutas, listas de equipo y mapas en un mismo sitio.
          </p>

          <button
            className="btn btn--block btn--lg shadow mt-6"
            style={{ background: '#fff', color: '#1a1a1a' }}
            onClick={onGoogle}
            disabled={busy}
          >
            <GoogleG size={20} /> Continuar con Google
          </button>

          <div className="row gap10 my-4 text-ink-3">
            <span className="h-px grow bg-[var(--line)]" />
            <span className="mono text-[11px]">o con tu correo</span>
            <span className="h-px grow bg-[var(--line)]" />
          </div>

          {mode === 'login' ? (
            <form className="stack gap12" onSubmit={loginForm.handleSubmit(onLogin)}>
              <Field
                label="Correo"
                type="email"
                placeholder="tu@correo.com"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <Field
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password')}
              />
              <button className="btn btn--block btn--lg" type="submit" disabled={busy}>
                <Icon name="user" size={18} /> {busy ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form className="stack gap12" onSubmit={registerForm.handleSubmit(onRegister)}>
              <Field
                label="Nombre"
                placeholder="Marcos Vidal"
                error={registerForm.formState.errors.displayName?.message}
                {...registerForm.register('displayName')}
              />
              <Field
                label="Usuario"
                placeholder="marcosvidal"
                error={registerForm.formState.errors.username?.message}
                {...registerForm.register('username')}
              />
              <Field
                label="Correo"
                type="email"
                placeholder="tu@correo.com"
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email')}
              />
              <Field
                label="Contraseña"
                type="password"
                placeholder="mínimo 8 caracteres"
                error={registerForm.formState.errors.password?.message}
                {...registerForm.register('password')}
              />
              <button className="btn btn--block btn--lg" type="submit" disabled={busy}>
                <Icon name="user" size={18} /> {busy ? 'Creando…' : 'Crear cuenta'}
              </button>
            </form>
          )}

          <p className="muted mt-4 text-center text-[13.5px]">
            {mode === 'login' ? '¿Aún no tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              type="button"
              className="text-accent underline-offset-2 hover:underline"
              onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
            >
              {mode === 'login' ? 'Crea una' : 'Entra'}
            </button>
          </p>

          <p className="faint mt-4 text-center text-xs leading-relaxed">
            Al continuar aceptas los <u>Términos</u> y la <u>Política de privacidad</u> de YourVivac.
          </p>
        </div>
      </div>
    </div>
  );
}
