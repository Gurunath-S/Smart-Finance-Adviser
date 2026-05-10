import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Card = ({ className, ...props }) => (
  <motion.div
    whileHover={{ 
      y: -5,
      rotateX: 2,
      rotateY: 2,
      transition: { duration: 0.2 }
    }}
    className={cn(
      'rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 perspective-1000',
      'hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20',
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('text-xl font-bold leading-none tracking-tight text-foreground', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
