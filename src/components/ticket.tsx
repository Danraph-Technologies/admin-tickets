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

      try {
        // 2. Fetch and convert to Base64
        const response = await fetch("/logo1.webp");
        const blob = await response.blob();
        
        return new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (!mounted) return;
                const base64 = reader.result as string;
                GLOBAL_LOGO_CACHE = base64; // Save to global cache
                setLogoSrc(base64);
                setIsReady(true);
                resolve();
            };
            reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Logo fetch error:", error);
        // Fallback to standard URL if fetch fails
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
        <div className="text-center">
          <h2 className="text-[25px] font-semibold ">DanRaph Ecocruise</h2>
          <p className="font-[Montserrat] text-[15px] ">
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
          <p className="text-center font-bold text-[19px] font-[Playfair_Display] ">
            Safe. Reliable. On Time
          </p>
          <p className="text-center font-medium text-[14px] ">
            Call: 07032950309 | 09168071385 | 08037006559{" "}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Ticket;
