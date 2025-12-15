import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
export default function Footer() {
  return (
    <footer className="w-full bg-[#09432B] text-white px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-xl font-bold mb-3">Lufasi Lodges</h2>
          <p className="text-sm leading-relaxed opacity-90">
            Lufasi Lodges invites you to unwind in the heart of nature. Set amid
            Cape Town’s tranquil landscape, our eco-pods blend sustainable
            design with luxurious comfort for an unforgettable escape.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>

          <div className="flex items-center gap-3 mb-2">
            <MapPin size={18} className="opacity-90" />
            <p className="text-sm opacity-90">
              Lufasi Lodges, Cape Town, South Africa
            </p>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Phone size={18} className="opacity-90" />
            <p className="text-sm opacity-90">+234 (0) 123 456 7890</p>
          </div>

          <div className="flex items-center gap-3">
            <Mail size={18} className="opacity-90" />
            <p className="text-sm opacity-90">stay@lufasilodges.com</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>

          <div className="flex items-center gap-4 mb-6">
            <a className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition">
              <Instagram size={18} />
            </a>
            <a className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition">
              <Facebook size={18} />
            </a>
            <a className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition">
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between text-sm opacity-90 gap-4">
        <p>© 2024 Lufasi Lodges. All rights reserved.</p>

        <div className="flex items-center gap-6">
          <a href="#" className="hover:opacity-100">
            Terms
          </a>
          <a href="#" className="hover:opacity-100">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
