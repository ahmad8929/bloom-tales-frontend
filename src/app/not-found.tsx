'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-4 bg-background">
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* 404 Number */}
        <div>
          <h1 className="animate-fade-up font-display text-8xl font-medium italic text-heading md:text-9xl">
            404
          </h1>
        </div>

        {/* Main Content */}
        <div className="animate-fade-up space-y-4" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display text-2xl font-medium text-heading md:text-3xl">
            This page has wandered off
          </h2>

          <p className="text-base leading-relaxed text-text-muted">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-primary hover:bg-hover text-primary-foreground">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/products">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Products
            </Link>
          </Button>
        </div>

        {/* Go Back Button */}
        <div>
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-text-muted hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}