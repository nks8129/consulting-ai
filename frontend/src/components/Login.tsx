import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Column - Value Proposition */}
          <div className="space-y-8">
            {/* Logo & Title */}
            <div className="space-y-4">
              <div className="inline-block rounded-2xl bg-blue-500 p-4 shadow-2xl shadow-blue-500/50">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                Your AI-Powered<br />Consulting Partner
              </h1>
              <p className="text-xl text-slate-300">
                Transform how you manage consulting engagements with intelligent automation, real-time insights, and seamless collaboration.
              </p>
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-500/20 p-2 mt-1">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI-Driven Insights</h3>
                  <p className="text-slate-400">Advanced reasoning to analyze requirements, identify risks, and uncover opportunities</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-green-500/20 p-2 mt-1">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Structured Methodology</h3>
                  <p className="text-slate-400">Guided workflows through Pre-Assessment, Discovery, Solution Design, and Implementation</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-purple-500/20 p-2 mt-1">
                  <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Smart Artifact Management</h3>
                  <p className="text-slate-400">Capture, organize, and retrieve requirements, designs, and documentation effortlessly</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-orange-500/20 p-2 mt-1">
                  <svg className="h-6 w-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Multi-User Collaboration</h3>
                  <p className="text-slate-400">Secure, isolated workspaces for teams with role-based access control</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-slate-400">Active Consultants</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">2,000+</div>
                <div className="text-sm text-slate-400">Projects Delivered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-sm text-slate-400">Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Sign In */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 shadow-2xl">
              <div className="text-center space-y-4">
                <div>
                  <div className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium text-white">
                    Simple Pricing
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-white">$9</span>
                    <span className="text-xl text-blue-100">/ user / month</span>
                  </div>
                  <p className="mt-2 text-blue-100">Everything you need to succeed</p>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-white">
                    <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Unlimited opportunities & projects</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Advanced AI insights & analysis</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Smart artifact management</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Team collaboration tools</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Priority support</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-sm text-blue-100">
                    14-day free trial • No credit card required
                  </div>
                </div>
              </div>
            </div>

            {/* Sign In Card */}
            <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 shadow-2xl">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Get Started Today</h2>
                  <p className="mt-2 text-slate-300">Sign in to access your consulting workspace</p>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-600 bg-white px-6 py-4 text-lg font-medium text-slate-900 transition-all hover:bg-slate-100 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <p className="text-xs text-slate-400">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
