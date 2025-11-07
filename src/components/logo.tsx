import { Briefcase } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

const Logo: FC<LogoProps> = ({ className }) => {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold text-foreground", className)}>
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Briefcase className="h-6 w-6" />
      </div>
      <span className="hidden sm:inline-block">CareerWise AI</span>
    </Link>
  );
};

export default Logo;
