import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
export const metadata: Metadata = { title: 'AmakTech Connect | Buy anything. Sell everything.', description: 'A multi-category marketplace by AmakTech Solutions.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><Header/><main>{children}</main><footer className="footer"><div className="container footer-inner"><div><strong>AmakTech Connect</strong><p>Buy anything. Sell everything. Connect with confidence.</p></div><div>Marketplace by <a href="https://amaktechsolutions.co.zw" target="_blank" rel="noreferrer">AmakTech Solutions</a></div><p>© {new Date().getFullYear()} AmakTech Connect</p></div></footer></body></html>; }
