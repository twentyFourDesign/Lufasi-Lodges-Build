/** Fixed bottom bar for primary funnel CTAs on small screens (hidden md+). */
export default function FunnelMobileStickyCta({ children }) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-[#F7F5F0]/95 backdrop-blur-sm px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      {children}
    </div>
  );
}
