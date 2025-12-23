'use client';

import { Facebook, Instagram, Twitter, Mail, Linkedin, MapPin, Phone, Clock, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" }
  ];

  const customerService = [
    { name: "FAQ", href: "/faq" },
    { name: "Shipping & Returns", href: "/shipping" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/bloomtales_clothing/", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "mailto:info@bloomtales.com", label: "Email" }
  ];

  return (
    <footer className="bg-[#5A3E2B] text-card relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border border-white/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border border-white/20 rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-32 right-1/3 w-12 h-12 border border-white/20 rounded-full animate-bounce delay-200"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-heading">
                Bloomtales Boutique
              </h2>
            </div>
            {/* <p className="text-card leading-relaxed">
              At Bloomtales Boutique, we believe in blending timeless elegance with modern trends.
              Discover curated collections crafted with love and attention to detail.
            </p> */}
            <div className="space-y-2 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Bareli, Uttar Pardesh, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 8076465961</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>eshaanZama@gmai.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Mon-Sat: 9AM-8PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card mb-4 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-primary"></div>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-card hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="border-b border-transparent group-hover:border-primary transition-all duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card mb-4 relative">
              Customer Service
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-primary"></div>
            </h3>
            <ul className="space-y-3">
              {customerService.map((link, index) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-card hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="border-b border-transparent group-hover:border-primary transition-all duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Info & Newsletter */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-card mb-4 relative">
                Developer
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-primary"></div>
              </h3>
              <p className="text-card text-sm leading-relaxed mb-3">
                Develope and maintain by ❤️ 
                <br/>
                {" "}
                <a
                  href="https://www.linkedin.com/in/ahmad8929/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:text-hover transition-colors duration-300 group"
                >
                  <span className="border-b border-transparent group-hover:border-primary transition-all duration-300">
                    Mohd Ahmad
                  </span>
                 
                  <br/>
                  <Linkedin className="w-3 h-3" />
                </a>
              </p>
              <p className="text-text-muted text-xs">
                Passionate about crafting clean, responsive, and high-performance web applications.
              </p>
            </div>
          </div>
        </div>

        {/* Divider with animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-text-normal px-4">
              <div className="w-12 h-0.5 bg-primary animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Icons */}
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <a 
                key={social.label}
                href={social.href} 
                target={social.href.startsWith('mailto') ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-10 h-10 bg-card/20 hover:bg-primary rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <social.icon className="w-5 h-5 text-card group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-text-normal text-card text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {social.label}
                </div>
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-text-muted">
              &copy; {currentYear} Bloomtales Boutique. All Rights Reserved.
            </p>
            <p className="text-xs text-text-muted mt-1">
              Made with <Heart className="w-3 h-3 inline text-accent animate-pulse" /> in India
            </p>
          </div>

          {/* Trust Badges */}
          {/* <div className="flex gap-3 opacity-70">
            <div className="text-xs text-text-muted bg-card/20 px-2 py-1 rounded border border-border">
              🔒 SSL Secured
            </div>
            <div className="text-xs text-text-muted bg-card/20 px-2 py-1 rounded border border-border">
              ✅ Verified Store
            </div>
          </div> */}
        </div>

        {/* Floating Animation */}
        <div className="absolute bottom-4 right-4 opacity-20">
          <div className="w-6 h-6 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
    </footer>
  );
}