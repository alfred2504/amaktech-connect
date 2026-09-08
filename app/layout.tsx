import './globals.css'

export const metadata = {
  title: 'AmakTech Connect',
  description: 'A diverse marketplace for electronics, home essentials, lifestyle products, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
