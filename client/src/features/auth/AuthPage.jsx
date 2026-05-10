import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, TrendingUp, PieChart, Lightbulb, Wallet, Sparkles } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-sans transition-colors duration-700 overflow-hidden perspective-1000">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
            animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.4, 0.3],
                x: [0, 50, 0],
                y: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
                x: [0, -40, 0],
                y: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]" 
        />
      </div>

      {/* Left Side: 3D Immersive Panel */}
      <div className="hidden lg:flex lg:w-[45%] p-16 flex-col justify-between relative z-10">
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 mb-20"
          >
            <div className="p-3 bg-primary rounded-2xl shadow-2xl shadow-primary/40 rotate-12">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Antigravity</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                <Sparkles className="h-3 w-3" />
                <span>Next Generation Finance</span>
            </div>
            <h1 className="text-7xl font-black mb-8 leading-[0.9] tracking-tighter text-foreground">
              Master Your <br />
              <span className="text-primary italic">Wealth.</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-md mb-16 leading-relaxed font-medium">
                Intuitive tracking, AI-powered insights, and institutional-grade security. 
                Everything you need to reach your financial goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-12">
            <FeatureItem icon={<TrendingUp />} title="Live Markets" desc="Track global assets in real-time." delay={0.4} />
            <FeatureItem icon={<PieChart />} title="Smart Budgets" desc="Automated spending analysis." delay={0.5} />
            <FeatureItem icon={<Lightbulb />} title="AI Advisory" desc="Personalized wealth strategies." delay={0.6} />
            <FeatureItem icon={<Wallet />} title="Multi-Vault" desc="Manage multiple wallets securely." delay={0.7} />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
        >
          <span>© 2026 Smart Finance Adviser</span>
          <div className="flex gap-6">
            <span className="hover:text-primary cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
          </div>
        </motion.div>
      </div>

      {/* Right Side: 3D Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <div className="w-full max-w-[460px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="bg-card/40 backdrop-blur-3xl p-8 lg:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border/50 relative overflow-hidden"
          >
            {/* Form Toggle Header */}
            <div className="relative mb-12">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-4xl font-black tracking-tighter text-foreground italic">
                        {isLogin ? 'Welcome Back' : 'Get Started'}
                    </h2>
                </div>
                <div className="h-1 w-12 bg-primary rounded-full" />
            </div>

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
                  <p className="mt-10 text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    New to Antigravity?{' '}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-primary hover:underline underline-offset-4"
                    >
                      Create Account
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
                  <p className="mt-10 text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Already a member?{' '}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-primary hover:underline underline-offset-4"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-start space-x-5 group"
  >
    <div className="p-4 bg-card border border-border shadow-lg rounded-2xl shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-6">
      {React.cloneElement(icon, { className: "h-6 w-6" })}
    </div>
    <div>
      <h3 className="font-black text-lg leading-tight mb-2 text-foreground tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed font-medium">{desc}</p>
    </div>
  </motion.div>
);

export default AuthPage;
