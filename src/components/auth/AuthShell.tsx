'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const EASE_LUXE = [0.22, 1, 0.36, 1] as const;

interface AuthShellProps {
  children: React.ReactNode;
  eyebrow?: string;
  quote?: string;
  image?: string;
}

export function AuthShell({
  children,
  eyebrow = 'Bloomtales Boutique',
  quote = 'Every wardrobe deserves a story worth telling.',
  image = '/hero2/hero-2.png',
}: AuthShellProps) {
  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      {/* Editorial imagery */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE_LUXE }}
          className="absolute inset-0"
        >
          <Image
            src={image}
            alt="Bloomtales collection"
            fill
            className="object-cover object-top"
            sizes="50vw"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE_LUXE }}
          >
            <p className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-wider2 text-gold">
              {eyebrow}
            </p>
            <p className="max-w-md font-display text-3xl font-medium leading-snug !text-ivory">
              “{quote}”
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-5 py-14 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_LUXE }}
          className="w-full max-w-xl"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
