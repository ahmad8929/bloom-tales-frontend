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
          <h1 className="text-8xl md:text-9xl font-bold text-heading">
            404
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-heading">
            Page Not Found
          </h2>
          
          <p className="text-base text-text-muted leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
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