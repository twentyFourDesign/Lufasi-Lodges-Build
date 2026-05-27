import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
const heroImage = "/main-home.jpeg";
import heroImageMobile from "../../assets/image-mobile.png";
import Navbar from "../../components/shared/Navbar/Navbar";
import { ArrowRight } from "lucide-react";
import BookingForm from "@/components/Home/BookingForm/BookingForm";
import Footer from "@/components/shared/Footer/Footer";
import { Link } from "react-router-dom";
import ComingSoonPage from "@/components/shared/ComingSoonPage";
import { isComingSoonEnabled, BASE_URL } from "@/config";

// TEMPORARY: floating email-test button on the home page. Remove once SMTP is verified.
function EmailTestButton() {
  const [email, setEmail] = useState("vishurizz0@gmail.com");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendTest = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${BASE_URL}/config/email/test-public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email }),
      });
      const data = await res.json();
      setStatus({ ok: !!data.ok, data });
    } catch (err) {
      setStatus({ ok: false, data: { error: err.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80 text-left">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[#09432B]">Email SMTP Test</h4>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <label className="block text-xs text-gray-600 mb-1">Send test to</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3 text-black"
            placeholder="you@example.com"
          />
          <button
            onClick={sendTest}
            disabled={loading || !email}
            className="w-full bg-[#09432B] text-white text-sm font-semibold py-2 rounded hover:bg-[#083f28] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send test email"}
          </button>
          {status && (
            <div
              className={`mt-3 text-xs rounded p-2 border ${
                status.ok
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="font-semibold mb-1">
                {status.ok ? "Sent ✓" : "Failed ✗"}
              </div>
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(status.data, null, 2)}
              </pre>
              {status.ok && (
                <div className="mt-1 italic">Check inbox (and Spam).</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#09432B] text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg hover:bg-[#083f28]"
        >
          Test email
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isComingSoonEnabled()) {
    return <ComingSoonPage />;
  }

  return (
    <div
      style={{
        backgroundImage: `url(${isMobile ? heroImageMobile : heroImage})`,
      }}
      className="
        w-full min-h-[85vh] md:min-h-screen
        bg-cover bg-[center_right_15%] md:bg-center bg-no-repeat
        -mt-6 p-0 overflow-auto overflow-x-hidden opacity-98
      "
    >
      {/* NAVBAR */}
      <Navbar />

      {/* HERO CONTENT */}
      <div
        className="
          w-full
          flex flex-col items-center text-center text-white px-4
          justify-center pt-32
          sm:pt-48 sm:justify-start
          lg:pt-40 lg:justify-center
          
        "
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-md">
          Wake Up Wild
        </h1>

        <p className="max-w-xl text-base md:text-lg font-semibold mb-6 drop-shadow-md">
          Immerse yourself in the rhythm of nature, surrounded by refined beauty
          and effortless elegance. Welcome to Lufasi Lodges.
        </p>

        {/* HERO BUTTONS */}
        <div className="flex gap-3 mb-10">
          <Button
            className="
              bg-[#B5AB84] text-white font-bold
              px-5 py-2 md:px-6 md:py-3
              rounded-md hover:bg-[#a79b6e] transition
              h-10 md:h-12 flex items-center gap-2
            "
          >
            <Link to="/manage-your-booking">Manage Booking</Link>

            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            asChild
            variant="outline"
            className="
              text-white border border-white/40
              bg-white/0 backdrop-blur-md
              rounded-md font-bold
              px-4 py-2 md:px-6 md:py-3
              h-10 md:h-12
            "
          >
            <a
              href="https://www.lufasilodges.com/domes"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore our Lodges
            </a>
          </Button>
        </div>

        {/* BOOKING FORM */}
        <div className="w-full flex justify-center mb-10">
          <BookingForm />
        </div>
      </div>
      <div>
        <Footer />
      </div>

      {/* TEMP: remove once Gmail SMTP is verified */}
      <EmailTestButton />
    </div>
  );
}
