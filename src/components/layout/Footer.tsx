import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
    {children}
  </Link>
);

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-muted-foreground">Chic clothing for women and children.</p>
             <div className="flex space-x-4 mt-4">
                <SocialIcon href="https://instagram.com">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c-4.04.08-4.52.2-6.097.87-1.577.67-2.682 1.777-3.352 3.352C2.2 7.795 2.08 8.275 2 12.315c-.08 4.04-.2 4.52.87 6.097.67 1.577 1.777 2.682 3.352 3.352 1.577.67 2.057.79 6.097.87 4.04.08 4.52.2 6.097-.87 1.577-.67 2.682-1.777 3.352-3.352.79-1.577.87-2.057.87-6.097-.08-4.04-.2-4.52-.87-6.097-.67-1.577-1.777-2.682-3.352-3.352C16.835 2.2 16.355 2.08 12.315 2zM8.477 12a3.838 3.838 0 107.676 0 3.838 3.838 0 00-7.676 0z" clipRule="evenodd" />
                    <path d="M17.062 6.938a1.312 1.312 0 10-2.625 0 1.312 1.312 0 002.625 0z" />
                  </svg>
                </SocialIcon>
                 <SocialIcon href="https://facebook.com">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                 </SocialIcon>
                 <SocialIcon href="https://pinterest.com">
                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78.93-3.94 1.225-5.22.285-1.226-.22-2.13-.5-2.915-.295-.816.095-1.44.685-1.44.82 0 1.215.83 1.215 2.055 0 1.23-.78 3.065-1.185 4.75-.33 1.395.7 2.52 2.085 2.52 2.5 0 4.415-3.11 4.415-6.525 0-2.845-2.025-4.97-5.025-4.97-3.465 0-5.415 2.565-5.415 5.25 0 .99.375 2.055.84 2.655.09.12.105.24.075.36-.09.36-.3.96-.345 1.155-.06.285-.225.345-.495.225-1.425-.63-2.31-2.475-2.31-4.065 0-3.255 2.385-6.015 6.705-6.015 3.525 0 6.225 2.49 6.225 5.76 0 3.54-2.22 6.33-5.265 6.33-1.005 0-1.965-.525-2.295-1.125l-.645 2.46c-.24.915-.885 1.71-1.455 2.295A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                   </svg>
                 </SocialIcon>
            </div>
          </div>
          <div>
            <h4 className="font-headline font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link href="/shop?category=women" className="text-muted-foreground hover:text-primary">Women</Link></li>
              <li><Link href="/shop?category=men" className="text-muted-foreground hover:text-primary">Men</Link></li>
              <li><Link href="/shop?category=kids" className="text-muted-foreground hover:text-primary">Kids</Link></li>
              <li><Link href="/categories" className="text-muted-foreground hover:text-primary">All Collections</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQs</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Return Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold mb-4">Stay Connected</h4>
            <p className="text-muted-foreground mb-4">Subscribe to our newsletter for the latest deals and styles.</p>
            <form className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bloomtales Boutique. All Rights Reserved.</p>
          <p className="text-xs mt-2">We accept: Visa, Mastercard, UPI, Paytm, and Cash on Delivery.</p>
        </div>
      </div>
    </footer>
  );
}
