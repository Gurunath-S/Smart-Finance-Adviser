import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, TrendingUp, PieChart, Lightbulb } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Side: Illustration & Features */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-primary-700 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-8">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SFA</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Master Your Finances <br /> with Smart Advice.
          </h1>
          <p className="text-primary-100 text-lg max-w-md mb-12">
            Join thousands of users managing their wealth with AI-powered insights, 
            intuitive tracking, and secure financial management.
          </p>

          <div className="grid grid-cols-2 gap-8">
            <FeatureItem icon={<TrendingUp />} title="Track Growth" desc="Real-time income monitoring." />
            <FeatureItem icon={<PieChart />} title="Smart Budgets" desc="Automated expense categories." />
            <FeatureItem icon={<Lightbulb />} title="AI Insights" desc="Personalized financial tips." />
            <FeatureItem icon={<ShieldCheck />} title="Secure" desc="Enterprise-grade encryption." />
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-200">
          © 2026 Smart Finance Adviser. All rights reserved.
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm />
                <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Sign up for free
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignupForm onToggle={() => setIsLogin(true)} />
                <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div className="flex items-start space-x-3">
    <div className="p-2 bg-white/10 rounded-lg shrink-0">
      {React.cloneElement(icon, { className: "h-5 w-5" })}
    </div>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-primary-200">{desc}</p>
    </div>
  </div>
);

export default AuthPage;
