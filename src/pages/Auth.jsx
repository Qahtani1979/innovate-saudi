import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Building2, Chrome, Globe, ArrowLeft, Sparkles, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/components/LanguageContext';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated, isLoadingAuth, login, signUp, signInWithGoogle, signInWithMicrosoft, authError } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Redirect if already authenticated - to role-based dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoadingAuth) {
      // If there's a specific page they were trying to access, go there
      const from = location.state?.from?.pathname;
      if (from && from !== '/' && from !== '/auth') {
        navigate(from, { replace: true });
        return;
      }
      // Otherwise, redirect to their role-based dashboard
      // Redirect to persona landing dashboard for role-based routing
      navigate('/persona-landing-dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate, location]);

  // Show auth errors from URL (OAuth callback errors)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      toast({
        title: t({ en: 'Authentication Error', ar: 'خطأ في المصادقة' }),
        description: errorDescription || error,
        variant: 'destructive',
      });
    }
  }, [location, toast, t]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: t({ en: 'Please fill in all fields', ar: 'يرجى ملء جميع الحقول' }),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast({
        title: t({ en: 'Welcome back!', ar: 'مرحباً بعودتك!' }),
        description: t({ en: 'You have successfully logged in.', ar: 'لقد قمت بتسجيل الدخول بنجاح.' }),
      });
      // Redirect to persona landing for role-based dashboard
      const from = location.state?.from?.pathname;
      if (from && from !== '/' && from !== '/auth') {
        navigate(from, { replace: true });
      } else {
        navigate('/persona-landing-dashboard', { replace: true });
      }
    } catch (error) {
      toast({
        title: t({ en: 'Login failed', ar: 'فشل تسجيل الدخول' }),
        description: error.message || t({ en: 'Invalid email or password', ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !signupConfirmPassword || !fullName) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: t({ en: 'Please fill in all fields', ar: 'يرجى ملء جميع الحقول' }),
        variant: 'destructive',
      });
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: t({ en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة' }),
        variant: 'destructive',
      });
      return;
    }
    
    if (signupPassword.length < 6) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: t({ en: 'Password must be at least 6 characters', ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' }),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await signUp(signupEmail, signupPassword, { full_name: fullName });
      toast({
        title: t({ en: 'Account created!', ar: 'تم إنشاء الحساب!' }),
        description: t({ en: 'You have successfully signed up.', ar: 'لقد قمت بالتسجيل بنجاح.' }),
      });
      // Redirect to persona landing dashboard for role-based routing
      navigate('/persona-landing-dashboard', { replace: true });
    } catch (error) {
      let errorMessage = error.message || t({ en: 'Failed to create account', ar: 'فشل إنشاء الحساب' });
      if (error.message?.includes('already registered')) {
        errorMessage = t({ en: 'This email is already registered. Please login instead.', ar: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.' });
      }
      toast({
        title: t({ en: 'Signup failed', ar: 'فشل التسجيل' }),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: t({ en: 'Google Sign-In failed', ar: 'فشل تسجيل الدخول عبر Google' }),
        description: error.message || t({ en: 'Failed to sign in with Google', ar: 'فشل تسجيل الدخول باستخدام Google' }),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithMicrosoft();
    } catch (error) {
      toast({
        title: t({ en: 'Microsoft Sign-In failed', ar: 'فشل تسجيل الدخول عبر Microsoft' }),
        description: error.message || t({ en: 'Failed to sign in with Microsoft', ar: 'فشل تسجيل الدخول باستخدام Microsoft' }),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) return;
    
    setIsLoading(true);
    try {
      const { resetPassword } = useAuth;
      await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      toast({
        title: t({ en: 'Reset Email Sent', ar: 'تم إرسال بريد إعادة التعيين' }),
        description: t({ en: 'Check your email for the password reset link', ar: 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور' }),
      });
    } catch (error) {
      toast({
        title: t({ en: 'Reset Failed', ar: 'فشل إعادة التعيين' }),
        description: error.message || t({ en: 'Failed to send reset email', ar: 'فشل إرسال بريد إعادة التعيين' }),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    {
      icon: Target,
      title: t({ en: 'Challenge Management', ar: 'إدارة التحديات' }),
      description: t({ en: 'Identify and track municipal challenges effectively', ar: 'تحديد وتتبع التحديات البلدية بفعالية' })
    },
    {
      icon: Lightbulb,
      title: t({ en: 'Innovation Solutions', ar: 'حلول مبتكرة' }),
      description: t({ en: 'Connect with verified solution providers', ar: 'التواصل مع مزودي الحلول المعتمدين' })
    },
    {
      icon: TrendingUp,
      title: t({ en: 'Pilot Programs', ar: 'البرامج التجريبية' }),
      description: t({ en: 'Test and scale successful innovations', ar: 'اختبار وتوسيع نطاق الابتكارات الناجحة' })
    }
  ];

  return (
    <div className="min-h-screen flex" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        {/* Top Navigation */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-primary-foreground hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">{t({ en: 'Back to Home', ar: 'العودة للرئيسية' })}</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-primary-foreground hover:bg-primary-foreground/10 gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-foreground/20 rounded-xl">
              <Building2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">
                {t({ en: 'Innovation Platform', ar: 'منصة الابتكار' })}
              </h1>
              <p className="text-primary-foreground/80">
                {t({ en: 'Municipal Innovation Management', ar: 'إدارة الابتكار البلدي' })}
              </p>
            </div>
          </div>

          <p className="text-lg text-primary-foreground/90 mb-10 max-w-md leading-relaxed">
            {t({ 
              en: 'Empowering municipalities to innovate, collaborate, and deliver better services to citizens through smart solutions.', 
              ar: 'تمكين البلديات من الابتكار والتعاون وتقديم خدمات أفضل للمواطنين من خلال الحلول الذكية.' 
            })}
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="p-2.5 bg-primary-foreground/20 rounded-lg">
                  <feature.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">{feature.title}</h3>
                  <p className="text-sm text-primary-foreground/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-primary-foreground/20">
          <div>
            <p className="text-3xl font-bold text-primary-foreground">100+</p>
            <p className="text-sm text-primary-foreground/70">{t({ en: 'Municipalities', ar: 'بلدية' })}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary-foreground">500+</p>
            <p className="text-sm text-primary-foreground/70">{t({ en: 'Solutions', ar: 'حل' })}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary-foreground">200+</p>
            <p className="text-sm text-primary-foreground/70">{t({ en: 'Pilots', ar: 'تجربة' })}</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>{t({ en: 'Back', ar: 'رجوع' })}</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="gap-2"
              >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'العربية' : 'English'}
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                {t({ en: 'Innovation Platform', ar: 'منصة الابتكار' })}
              </h1>
            </div>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center">
                {t({ en: 'Welcome', ar: 'مرحباً' })}
              </CardTitle>
              <CardDescription className="text-center">
                {t({ en: 'Sign in to your account or create a new one', ar: 'سجل الدخول إلى حسابك أو أنشئ حساباً جديداً' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* OAuth Sign-In Buttons */}
              <div className="space-y-3 mb-4">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 h-11" 
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Chrome className="h-4 w-4" />
                  )}
                  {t({ en: 'Continue with Google', ar: 'المتابعة مع Google' })}
                </Button>
              </div>
              
              <div className="relative mb-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground whitespace-nowrap">
                  {t({ en: 'or continue with email', ar: 'أو تابع بالبريد الإلكتروني' })}
                </span>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">{t({ en: 'Login', ar: 'تسجيل الدخول' })}</TabsTrigger>
                  <TabsTrigger value="signup">{t({ en: 'Sign Up', ar: 'إنشاء حساب' })}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t({ en: 'Email', ar: 'البريد الإلكتروني' })}</Label>
                      <div className="relative">
                        <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder={t({ en: 'you@example.com', ar: 'you@example.com' })}
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className={`h-11 ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t({ en: 'Password', ar: 'كلمة المرور' })}</Label>
                      <div className="relative">
                        <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className={`h-11 ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="px-0 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          if (loginEmail) {
                            handleForgotPassword();
                          } else {
                            toast({
                              title: t({ en: 'Enter Email', ar: 'أدخل البريد الإلكتروني' }),
                              description: t({ en: 'Please enter your email address first', ar: 'يرجى إدخال بريدك الإلكتروني أولاً' }),
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        {t({ en: 'Forgot Password?', ar: 'نسيت كلمة المرور؟' })}
                      </Button>
                    </div>
                    
                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t({ en: 'Signing in...', ar: 'جاري تسجيل الدخول...' })}
                        </>
                      ) : (
                        t({ en: 'Sign In', ar: 'تسجيل الدخول' })
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t({ en: 'Full Name', ar: 'الاسم الكامل' })}</Label>
                      <div className="relative">
                        <User className={`absolute top-3 h-4 w-4 text-muted-foreground ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder={t({ en: 'John Doe', ar: 'محمد أحمد' })}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={`h-11 ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t({ en: 'Email', ar: 'البريد الإلكتروني' })}</Label>
                      <div className="relative">
                        <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder={t({ en: 'you@example.com', ar: 'you@example.com' })}
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className={`h-11 ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t({ en: 'Password', ar: 'كلمة المرور' })}</Label>
                      <div className="relative">
                        <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className={`h-11 ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">{t({ en: 'Confirm Password', ar: 'تأكيد كلمة المرور' })}</Label>
                      <div className="relative">
                        <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                        <Input
                          id="signup-confirm"
                          type="password"
                          placeholder="••••••••"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className={`h-11 ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t({ en: 'Creating account...', ar: 'جاري إنشاء الحساب...' })}
                        </>
                      ) : (
                        t({ en: 'Create Account', ar: 'إنشاء حساب' })
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t({ 
              en: 'By continuing, you agree to our Terms of Service and Privacy Policy.', 
              ar: 'بالمتابعة، فإنك توافق على شروط الخدمة وسياسة الخصوصية.' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
