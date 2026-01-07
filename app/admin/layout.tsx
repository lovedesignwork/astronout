import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { FlyonUIScript } from '@/components/FlyonUIScript';
import { Outfit } from 'next/font/google';

// Configure Outfit font from Google Fonts
// https://fonts.google.com/specimen/Outfit
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is authenticated and is admin
  if (user) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      redirect('/mylogin?error=unauthorized');
    }
  }

  return (
    <html lang="en" data-theme="light" className={`bg-base-100 ${outfit.variable}`}>
      <body className={`${outfit.className} antialiased bg-base-100 min-h-screen text-base-content`}>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Header Bar */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a href="/admin" className="text-gray-500 hover:text-primary">Admin</a></li>
                    <li className="text-gray-900 font-medium">Dashboard</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="h-9 w-56 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                
                {/* Notifications */}
                <button className="relative flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">3</span>
                </button>

                {/* Profile Avatar */}
                <button className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow">
                  A
                </button>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6 bg-gray-50">
              {children}
            </main>
          </div>
        </div>
        <FlyonUIScript />
      </body>
    </html>
  );
}
