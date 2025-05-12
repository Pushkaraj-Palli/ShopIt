"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface QuickAuthProps {
  children: React.ReactNode;
  defaultTab?: "login" | "register";
}

export function QuickAuth({ children, defaultTab = "login" }: QuickAuthProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const { toast } = useToast();
  const { login, register: registerUser, isLoading, user } = useAuth();
  
  const { 
    register: registerLogin, 
    handleSubmit: handleLoginSubmit, 
    formState: { errors: loginErrors },
    reset: resetLoginForm
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  
  const { 
    register: registerSignup, 
    handleSubmit: handleRegisterSubmit, 
    formState: { errors: registerErrors },
    reset: resetRegisterForm
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });
  
  const onLogin = async (data: LoginFormValues) => {
    const success = await login(data.email, data.password);
    
    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back to ShopIt E-commerce!",
        duration: 3000,
      });
      
      resetLoginForm();
      setIsOpen(false);
    }
  };
  
  const onRegister = async (data: RegisterFormValues) => {
    const success = await registerUser(data.name, data.email, data.password);
    
    if (success) {
      toast({
        title: "Registration successful",
        description: "Your account has been created. Welcome to ShopIt!",
        duration: 3000,
      });
      
      resetRegisterForm();
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>My Account</SheetTitle>
          <SheetDescription>
            Login or create a new account to manage your orders and preferences.
          </SheetDescription>
        </SheetHeader>
        
        {user ? (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-medium">Welcome, {user.name}</h3>
              <p className="text-sm text-muted-foreground">You are currently logged in</p>
            </div>
            <Button 
              onClick={() => setIsOpen(false)} 
              className="w-full" 
              asChild
            >
              <Link href="/account">My Account</Link>
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input
                    id="email-login"
                    placeholder="name@example.com"
                    {...registerLogin('email')}
                    disabled={isLoading}
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-red-500">{loginErrors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-login">Password</Label>
                    <Link 
                      href="/account/forgot-password" 
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password-login"
                    type="password"
                    placeholder="••••••••"
                    {...registerLogin('password')}
                    disabled={isLoading}
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-red-500">{loginErrors.password.message}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-register">Full Name</Label>
                  <Input
                    id="name-register"
                    placeholder="John Doe"
                    {...registerSignup('name')}
                    disabled={isLoading}
                  />
                  {registerErrors.name && (
                    <p className="text-sm text-red-500">{registerErrors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input
                    id="email-register"
                    placeholder="name@example.com"
                    {...registerSignup('email')}
                    disabled={isLoading}
                  />
                  {registerErrors.email && (
                    <p className="text-sm text-red-500">{registerErrors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-register">Password</Label>
                  <Input
                    id="password-register"
                    type="password"
                    placeholder="••••••••"
                    {...registerSignup('password')}
                    disabled={isLoading}
                  />
                  {registerErrors.password && (
                    <p className="text-sm text-red-500">{registerErrors.password.message}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
        
        <SheetFooter className="mt-6 flex-col space-y-2">
          {user ? (
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          ) : (
            <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
              <Link href={activeTab === "login" ? "/account/register" : "/account/login"}>
                {activeTab === "login" ? "Full Registration" : "Full Login"} Page
              </Link>
            </Button>
          )}
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link 
              href="/terms" 
              className="underline underline-offset-4 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link 
              href="/privacy" 
              className="underline underline-offset-4 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Privacy Policy
            </Link>.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 