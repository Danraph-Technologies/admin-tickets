import { type RefObject, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface TicketProps {
  amount?: string;
  ticketId?: string;
  dateIssued?: string;
  type?: string;
  validFor?: string;
  qrValue?: string;
  rootRef?: RefObject<HTMLDivElement | null>;
}

// Global cache outside component to persist across re-renders
let GLOBAL_LOGO_CACHE: string | null = null;
let LOGO_LOAD_PROMISE: Promise<string> | null = null;

function Ticket({
  amount = "₦300",
  ticketId = "#DR-XXXXXXXX-XXX",
  dateIssued,
  type = "Printed",
  validFor = "Single Trip",
  qrValue,
  rootRef,
}: TicketProps) {
  const [logoSrc, setLogoSrc] = useState<string>("/logo1.webp"); // Default fallback
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    let mounted = true;

    const initLogo = async () => {
      // 1. If we have it cached in memory, use it immediately
      if (GLOBAL_LOGO_CACHE) {
        setLogoSrc(GLOBAL_LOGO_CACHE);
        setIsReady(true);
        return;
      }

      // 2. If already loading, wait for the existing promise
      if (LOGO_LOAD_PROMISE) {
        try {
          const cachedLogo = await LOGO_LOAD_PROMISE;
          if (mounted && cachedLogo) {
            setLogoSrc(cachedLogo);
            setIsReady(true);
          }
        } catch (error) {
          console.error("Failed to load cached logo:", error);
        }
        return;
      }

      // 3. Start loading the logo
      LOGO_LOAD_PROMISE = (async () => {
        try {
          // Try WebP first with timeout for mobile networks
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          let response = await fetch("/logo1.webp", { 
            signal: controller.signal,
            cache: 'force-cache' // Use cache aggressively on mobile
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error("WebP not supported");
          }
          
          const blob = await response.blob();
          
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              GLOBAL_LOGO_CACHE = base64;
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Logo fetch error:", error);
          // iOS fallback: Use a simple SVG logo
          const fallbackLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDA0N0FFIi8+Cjx0ZXh0IHg9IjUwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RGFuUmFwaDwvdGV4dD4KPHRleHQgeD0iNTAiIHk9IjY1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FY29jcnVpc2U8L3RleHQ+Cjwvc3ZnPgo=";
          GLOBAL_LOGO_CACHE = fallbackLogo;
          return fallbackLogo;
        }
      })();

      try {
        const logo = await LOGO_LOAD_PROMISE;
        if (mounted) {
          setLogoSrc(logo);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Logo loading failed:", error);
        if (mounted) setIsReady(true);
      }
    };

    initLogo();

    return () => { mounted = false; };
  }, []);
  // If ticketId is available and no explicit qrValue provided, link to the app's /verify route
  if (!qrValue && typeof window !== "undefined" && ticketId) {
    try {
      qrValue = `${window.location.origin}/verify?ticketId=${encodeURIComponent(
        ticketId
      )}`;
    } catch (e) {
      qrValue = `https://tickets.ecocruise.org/${ticketId}`;
    }
  }
  // Use backend-provided dateIssued when available; otherwise compute today's date
  const issued =
    dateIssued ||
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });


  return (
    <div className="flex justify-center items-center">
      <div
        ref={rootRef}
        className="bg-white max-w-[330px] w-full border "
        style={{ width: 320, backgroundColor: '#ffffff' }} // Explicit background for Safari
        // Mark the DOM element as ready only when image logic is done
        data-ticket-ready={isReady ? "true" : "false"}
      >
        <p className="text-right p-3 font-bold ">{amount}</p>
        <div className="flex justify-center items-center h-[110px] w-full"> 
          {/* 
             iPhone Fix: 
             1. Key forces re-render when src changes 
             2. explicit width attribute 
             3. REMOVED crossOrigin="anonymous" 
          */}
          <img
            key={logoSrc} 
            src={logoSrc}
            alt="DanRaph Ecocruise Logo"
            width="100" // Explicit attribute
            height="100" // Explicit attribute (helps layout)
            className="w-[100px]"
            style={{ 
              width: '100px', 
              height: 'auto', 
              display: 'block',
              objectFit: 'contain' 
            }}
          />
        </div>
        <div className="text-center ios-fix">
          <h2 className="text-[25px] font-semibold font-montserrat-fallback">DanRaph Ecocruise</h2>
          <p className="font-[Montserrat] text-[15px] font-montserrat-fallback">
            Operator Of Maduka Shuttle Services
          </p>
        </div>
        <div className="border-2 border-gray-400 mx-5 my-5 flex items-center justify-between p-5 px-2 ">
          <div className=" text-left flex flex-col gap-2 ">
            <p className="text-[14px]">
              <span className="font-semibold text-[14xp] "> Ticket ID: </span>
              <span>{ticketId}</span>
            </p>
            <p className="text-[14px]">
              <span className="font-semibold text-[14px] "> Date Issued: </span>
              <span>{issued}</span>
            </p>
            <p className="text-[14px]">
              <span className="font-semibold  ">Type: </span>
              <span>{type}</span>
            </p>

            <p className="text-[14px]">
              <span className="font-semibold">Valid For: </span>
              <span>{validFor}</span>
            </p>
          </div>
          <div>
            <QRCodeSVG value={qrValue || ""} size={63} />
          </div>
        </div>
        <div className="border-[1.3px] my-5 mx-5 "></div>

        <div className="pb-5">
          <p className="text-center font-bold text-[19px] font-[Playfair_Display] font-playfair-fallback ios-fix">
            Safe. Reliable. On Time
          </p>
          <p className="text-center font-medium text-[14px] ios-fix">
            Call: 07032950309 | 09168071385 | 08037006559{" "}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Ticket;
