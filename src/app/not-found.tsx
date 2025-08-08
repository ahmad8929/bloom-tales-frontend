'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFoundPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-24 h-24 border-2 border-purple-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-pink-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 border-2 border-purple-300 rounded-full animate-pulse delay-100"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        {/* 404 Animation */}
        <div className="mb-8 relative">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
          <div className="absolute -top-4 -right-4 text-4xl animate-bounce">🌸</div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Oops! Page Not Found
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
            The page you're looking for seems to have wandered off like a butterfly in our boutique garden. 
            Don't worry, let's help you find your way back to beautiful fashion!
          </p>

          {/* Suggestions */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-purple-100 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What would you like to do?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              
              <Link href="/products">
                <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50 transition-all duration-300 h-12">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Popular Links */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">Or explore these popular sections:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/category/saree">
                <span className="inline-block px-4 py-2 bg-white/70 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors duration-300 border border-purple-200">
                  Sarees
                </span>
              </Link>
              <Link href="/category/kurti">
                <span className="inline-block px-4 py-2 bg-white/70 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors duration-300 border border-purple-200">
                  Kurtis
                </span>
              </Link>
              <Link href="/products?isNewArrival=true">
                <span className="inline-block px-4 py-2 bg-white/70 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors duration-300 border border-purple-200">
                  New Arrivals
                </span>
              </Link>
              <Link href="/products?isSale=true">
                <span className="inline-block px-4 py-2 bg-white/70 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors duration-300 border border-purple-200">
                  Sale Items
                </span>
              </Link>
            </div>
          </div>

          {/* Go Back Button */}
          <div className="pt-4">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-purple-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Additional Animation */}
        <div className="mt-12 animate-bounce">
          <div className="text-6xl">🦋</div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 left-10 opacity-20 animate-float">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
      </div>
      <div className="absolute top-20 right-16 opacity-20 animate-float-delayed">
        <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}