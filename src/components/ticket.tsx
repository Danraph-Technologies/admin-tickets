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

// Preload and cache the logo
const preloadLogo = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load logo'));
    img.src = src;
  });
};

// Cache for the logo
let logoCache: string | null = null;

function Ticket({
  amount = "₦300",
  ticketId = "#DR-XXXXXXXX-XXX",
  dateIssued,
  type = "Printed",
  validFor = "Single Trip",
  qrValue,
  rootRef,
}: TicketProps) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>("/logo1.webp");
  
  // Preload logo on mount
  useEffect(() => {
    const loadLogo = async () => {
      try {
        // Try to use cached logo first
        if (logoCache) {
          setLogoSrc(logoCache);
          setLogoLoaded(true);
          return;
        }
        
        // Preload the logo
        await preloadLogo("/logo1.webp");
        
        // Convert to base64 for better reliability
        const response = await fetch("/logo1.webp");
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64 = reader.result as string;
          logoCache = base64; // Cache the base64
          setLogoSrc(base64);
          setLogoLoaded(true);
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to preload logo:", error);
        // Still mark as loaded to prevent blocking forever
        setLogoLoaded(true);
      }
    };
    
    loadLogo();
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

  // When the logo finishes loading, dispatch a DOM event so external
  // consumers (like html-to-image) can wait for the ticket to be ready.
  useEffect(() => {
    if (!logoLoaded) return;
    try {
      const root = rootRef && (rootRef as RefObject<HTMLDivElement | null>)?.current;
      if (root) {
        // Set the attribute again to be safe
        root.setAttribute("data-logo-loaded", "true");
        const ev = new CustomEvent("ticket-ready", { 
          detail: { logoLoaded: true },
          bubbles: true 
        });
        root.dispatchEvent(ev);
      }
    } catch (e) {
      console.error("Failed to dispatch ticket-ready event:", e);
    }
  }, [logoLoaded, rootRef]);

  return (
    <div className="flex justify-center items-center">
      <div
        ref={rootRef}
        className="bg-white max-w-[330px] w-full border "
        style={{ width: 320 }}
        // add an attribute that external code can check: data-logo-loaded
        data-logo-loaded={logoLoaded}
      >
        <p className="text-right p-3 font-bold ">{amount}</p>
        <div className="flex justify-center items-center ">
          <img
            src={logoSrc}
            alt="DanRaph Ecocruise Logo"
            className="w-[100px] "
            onLoad={() => {
              if (!logoLoaded) setLogoLoaded(true);
            }}
            onError={() => {
              console.error("Logo failed to load in img tag");
              if (!logoLoaded) setLogoLoaded(true);
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
