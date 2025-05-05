import * as React from "react";
import Link from "next/link";

interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

function Breadcrumb({ children, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center text-sm text-muted-foreground ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1">
        {children}
      </ol>
    </nav>
  );
}

interface BreadcrumbItemProps {
  children: React.ReactNode;
  href?: string;
  isCurrent?: boolean;
}

function BreadcrumbItem({ children, href, isCurrent }: BreadcrumbItemProps) {
  if (href) {
    return (
      <li className="flex items-center">
        <Link href={href} className="hover:text-foreground font-medium transition-colors">
          {children}
        </Link>
        <span className="mx-2 text-gray-300">/</span>
      </li>
    );
  }
  return (
    <li className="flex items-center text-foreground font-medium" aria-current={isCurrent ? "page" : undefined}>
      {children}
    </li>
  );
}

Breadcrumb.Item = BreadcrumbItem;

export { Breadcrumb }; 