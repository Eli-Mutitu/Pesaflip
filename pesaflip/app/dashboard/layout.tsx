import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="lg:pl-72 pt-16 lg:pt-0">
        <Header />
        <main className="p-4 md:p-6 pt-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 