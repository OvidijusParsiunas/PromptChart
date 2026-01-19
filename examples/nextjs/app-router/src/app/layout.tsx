import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PromptChart - Next.js App Router',
  description: 'Turn natural language into charts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
