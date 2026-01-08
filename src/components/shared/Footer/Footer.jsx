import {
  MapPin,
  Phone,
  Clock,
  Instagram,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#09432B] text-white px-6 md:px-12 lg:px-20 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-lg font-bold mb-2">Lufasi Lodges</h2>
          <p className="text-sm leading-relaxed opacity-80">
            Unwind in the heart of nature with eco-pods that blend sustainable design with luxurious comfort.
          </p>
        </div>

        {/* Booking Office */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Booking Office</h3>
          <p className="text-xs opacity-80 mb-1">Ikoyi Office - Little Company Nigeria Limited</p>
          <p className="text-xs opacity-80 mb-1">6 Olu Holloway Rd, Ikoyi, Lagos</p>
          <p className="text-xs opacity-80 mb-1">12noon-8pm (closed Tuesdays)</p>
          <a
            href="https://wa.me/2348060554342"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-80 hover:opacity-100 hover:underline"
          >
            +234 806 055 4342
          </a>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Follow Us</h3>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/lufasilodges/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://wa.me/2348060554342"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-white/20 flex flex-col md:flex-row items-center justify-between text-xs opacity-80 gap-2">
        <p>© 2024 Lufasi Lodges. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:opacity-100">Terms</a>
          <a href="#" className="hover:opacity-100">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
