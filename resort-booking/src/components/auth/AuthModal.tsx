import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, error } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
      onClose();
      loginForm.reset();
    } catch (error) {
      // Error is handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      await signUp(data.email, data.password, data.firstName, data.lastName);
      onClose();
      signupForm.reset();
    } catch (error) {
      // Error is handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    loginForm.reset();
    signupForm.reset();
    setMode('login');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'login' ? 'Welcome back' : 'Create your account'}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...loginForm.register('email')}
              error={loginForm.formState.errors.email?.message}
            />
            
            <Input
              label="Password"
              type="password"
              {...loginForm.register('password')}
              error={loginForm.formState.errors.password?.message}
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
            >
              Sign in
            </Button>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                {...signupForm.register('firstName')}
                error={signupForm.formState.errors.firstName?.message}
              />
              
              <Input
                label="Last Name"
                {...signupForm.register('lastName')}
                error={signupForm.formState.errors.lastName?.message}
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              {...signupForm.register('email')}
              error={signupForm.formState.errors.email?.message}
            />
            
            <Input
              label="Password"
              type="password"
              {...signupForm.register('password')}
              error={signupForm.formState.errors.password?.message}
            />
            
            <Input
              label="Confirm Password"
              type="password"
              {...signupForm.register('confirmPassword')}
              error={signupForm.formState.errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
            >
              Create account
            </Button>
          </form>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-base">
            <span className="px-2 bg-white text-gray-900">or</span>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={toggleMode}
            className="text-airbnb-red hover:underline font-medium"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>

        {mode === 'login' && (
          <div className="text-center">
            <button className="text-base text-gray-900 hover:text-gray-800">
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AuthModal; 