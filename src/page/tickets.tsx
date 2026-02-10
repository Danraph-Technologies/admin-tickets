import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Ticket from "../components/ticket";
import { toJpeg } from "html-to-image";
import { Toaster, toast } from "sonner";

// Enhanced helper with retry logic
const waitForTicketReady = (
  root: Element | null, 
  timeout = 5000,
  retries = 3
): Promise<boolean> => {
  return new Promise(async (resolve) => {
    if (!root) return resolve(false);
    
    let attemptCount = 0;
    
    const attemptCheck = async (): Promise<boolean> => {
      attemptCount++;
      
      // Check if already ready
      if (root.getAttribute("data-logo-loaded") === "true") {
        return true;
      }
      
      // Wait for event
      return new Promise((innerResolve) => {
        let tid: number;
        
        const onReady = () => {
          cleanup();
          innerResolve(true);
        };
        
        const onTimeout = () => {
          cleanup();
          innerResolve(false);
        };
        
        const cleanup = () => {
          try {
            root.removeEventListener("ticket-ready", onReady);
          } catch (e) {
            /* ignore */
          }
          clearTimeout(tid);
        };
        
        root.addEventListener("ticket-ready", onReady, { once: true });
        tid = setTimeout(onTimeout, timeout) as unknown as number;
      });
    };
    
    // Try with retries
    for (let i = 0; i < retries; i++) {
      const ready = await attemptCheck();
      if (ready) {
        resolve(true);
        return;
      }
      
      // Wait a bit before retrying
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
    
    resolve(false);
  });
};

function tickets() {
  // Steps: 1 = previous 'Generate Ticket' (already completed),
  // 2 = Input Amount, 3 = Email/Phone, 4 = Confirm Details
  const [step, setStep] = useState<number>(2);
  const [amount, setAmount] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const STORAGE_KEY = "admin-ticket-form";

  const MIN_STEP = 2;
  const MAX_STEP = 5;
  const TOTAL_NODES = 5; // 5 nodes (1..5)
  const [generated, setGenerated] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [dateIssued, setDateIssued] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  // validation handled with toast notifications instead of inline UI
  const ticketRef = useRef<HTMLDivElement | null>(null);
  // Resolve backend API base depending on environment
  const API_BASE =
    typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:4000'
      : 'https://ticket-backend-davetechinnovation1440-jgqqgsbi.leapcell.dev';

  // Load persisted form state (amount, email, phone, step) from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.amount) setAmount(parsed.amount);
      if (parsed?.email) setEmail(parsed.email);
      if (parsed?.phone) setPhone(parsed.phone);
      if (typeof parsed?.generated === 'boolean') setGenerated(parsed.generated);
      if (typeof parsed?.ticketId === 'string') setTicketId(parsed.ticketId);
      if (typeof parsed?.dateIssued === 'string') setDateIssued(parsed.dateIssued);
      if (parsed?.step) setStep(parsed.step);
      // If a ticket was previously generated, ensure we remain on the Ticket step after refresh
      if (parsed?.generated && parsed?.ticketId && parsed?.dateIssued && (!parsed?.step || parsed?.step < 5)) {
        setStep(5);
      }
    } catch (e) {
      // ignore parse errors
      console.warn("failed to load persisted form state", e);
    }
  }, []);

  // Persist form state whenever amount, email, phone, or step changes
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      const toSave = { amount, email, phone, step, generated, ticketId, dateIssued };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn("failed to persist form state", e);
    }
  }, [amount, email, phone, step, generated, ticketId, dateIssued]);

  // Simple client-side validators
  const isValidAmount = (val: string) => {
    const n = Number(val);
    return !Number.isNaN(n) && n >= 300; // minimum amount is 300
  };

  const isValidEmail = (val: string) => {
    // Basic email regex (sufficient for client-side check)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  function next() {
    setStep((s) => Math.min(MAX_STEP, s + 1));
  }

  function back() {
    setStep((s) => Math.max(MIN_STEP, s - 1));
  }

  return (
    <div className="bg-[#f1f8fe] flex justify-center items-center py-8">
      <Toaster richColors position="top-center" />
      <div className="bg-white max-h-[95vh] overflow-y-auto p-5 mx-2 rounded-lg max-w-[800px] w-full  text-center  ">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Go back"
            title="Go back"
            onClick={() => {
            // If a ticket was just generated, go back to the Amount input (step 2)
            // and reset the generated state so the user can start a new flow.
            if (generated) {
            setGenerated(false);
            setTicketId(null);
            setDateIssued(null);
            setAmount("");
            setEmail("");
            setPhone("");
            setStep(MIN_STEP);
            try {
            if (typeof window !== "undefined" && window.localStorage)
            window.localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
            /* ignore */
            }
            return;
            }
            
            // If we're inside the stepper, go back a step; otherwise navigate browser back
            if (step > MIN_STEP) back();
            else if (
            typeof window !== "undefined" &&
            window.history &&
            window.history.length
            )
            window.history.back();
            }}
          >
            <ArrowLeft className="cursor-pointer" />
          </button>
          <div>
            <h2 className="sm:text-[30px] text-[20px] font-bold ">
              DanRaph Ecocruise
            </h2>
            <p className="text-gray-600 text-[16px] sm:text-[18px] font-medium">
              Maduka Shuttle Bus
            </p>
          </div>
          <div />
        </div>

        <div className="sm:flex sm:justify-between grid grid-cols-5 gap-2 py-5 ">
          {[
            "Click Generate Ticket",
            "Type in Amount",
            "Add your Email & Phone",
            "Confirm Details",
            "Ticket",
          ].map((label, idx) => {
            const index = idx + 1; // 1..5
            const completed = index < step;
            const active = index === step;
            // If we're on the final node (5) and it's active, treat as completed (show green check)
            let bgClass = "bg-gray-400";
            if (completed) bgClass = "bg-green-600";
            else if (active)
              bgClass = index === TOTAL_NODES ? "bg-green-600" : "bg-blue-700";

            const showCheck =
              completed || (index === TOTAL_NODES && step === TOTAL_NODES);

            return (
              <div key={index} className="flex flex-col items-center">
                <p
                  className={`${bgClass} rounded-full w-[30px] h-[30px] flex justify-center items-center text-white`}
                >
                  {showCheck ? <Check /> : index}
                </p>
                <p className="text-[12px] sm:text-[16px] text-gray-700 ">
                  {label}
                </p>
              </div>
            );
          })}
        </div>
        <div className="py-2">
          <div className="bg-gray-400 w-full h-[7px] rounded-full relative">
            <div
              className="bg-blue-700 h-full rounded-full absolute left-0 top-0 transition-all duration-600 ease-in-out"
              style={{ width: `${((step - 1) / (TOTAL_NODES - 1)) * 100}%` }}
            />
          </div>
        </div>
        {/* Input Amount section */}
        {step === 2 && (
          <div className="text-left py-5 ">
            <label
              htmlFor=""
              className=" font-bold flex justify-between items-center "
            >
              <span className="sm:text-[23px] text-[20px] "> Input Amount</span>
              <button
                onClick={() => {
                  if (isValidAmount(amount)) next();
                  else
                    toast.error("Please enter a valid amount (minimum ₦300).");
                }}
                className="bg-blue-700 text-white px-3 py-1 rounded-md cursor-pointer hover:scale-105 hover:bg-blue-600 duration-300 transition-all"
              >
                Next
              </button>
            </label>
            <input
              type="number"
              name="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 mt-2 outline-none "
            />
            {/* validation now uses toast notifications */}
          </div>
        )}

        {/* Add Email &  Phone section */}
        {step === 3 && (
          <div className="text-left py-5 ">
            <label
              htmlFor=""
              className=" font-bold flex justify-between items-center "
            >
              <span className="sm:text-[23px] text-[20px] "> Email</span>
              <button
                onClick={() => {
                  if (isValidEmail(email)) next();
                  else toast.error("Please enter a valid email address.");
                }}
                className="bg-blue-700 text-white px-3 py-1 rounded-md cursor-pointer hover:scale-105 hover:bg-blue-600 duration-300 transition-all"
              >
                Next
              </button>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 mt-2 outline-none "
            />
            {/* validation now uses toast notifications */}

            <div className="text-left py-5 ">
              <label
                htmlFor=""
                className="font-bold sm:text-[23px] text-[20px] "
              >
                Phone Number
              </label>
              <input
                type="number"
                name="phone"
                id="phone"
                placeholder="Enter Phone Number. optional "
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 mt-2 outline-none "
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={back}
                className="bg-blue-700 text-white px-3 py-1 rounded-md cursor-pointer hover:scale-105 hover:bg-blue-600 duration-300 transition-all"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Confirm Details Section */}
        {step === 4 && (
          <div className="py-5 text-left">
            <h2 className="text-[20px] sm:text-[23px] font-bold  ">
              Comfirm Details
            </h2>
            <div />
            <p>
              <span className="font-semibold sm:text-[20px] text-[17px] ">
                Amount :
              </span>{" "}
              {amount}
            </p>
            <p>
              <span className="font-semibold sm:text-[20px] text-[17px] ">
                Email:{" "}
              </span>{" "}
              {email}
            </p>
            <p>
              <span className="font-semibold sm:text-[20px] text-[17px] ">
                Phone:
              </span>{" "}
              {phone}
            </p>
            <div className="flex justify-between py-2 items-center">
              <button
                onClick={back}
                className="bg-blue-700 text-white px-3 py-1 rounded-md cursor-pointer hover:scale-105 hover:bg-blue-600 duration-300 transition-all"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    const resp = await fetch(
                      `${API_BASE}/api/tickets`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ amount, email, phone }),
                      }
                    );
                    if (!resp.ok)
                      throw new Error(`Server error ${resp.status}`);
                    const data = await resp.json();
                    setTicketId(data.ticketId);
                    // Prefer human-readable dateIssued; fall back to ISO timestamp formatted to en-GB
                    if (data.dateIssued) {
                      setDateIssued(data.dateIssued);
                    } else if (data.dateIssuedIso) {
                      const d = new Date(data.dateIssuedIso);
                      setDateIssued(
                        d.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      );
                    }
                    setGenerated(true);
                    setStep(5);
                    // keep persisted form/ticket state so the generated ticket remains visible after reload

                    // Wait a tick for the ticket component to mount, then capture it
                    setTimeout(async () => {
                      try {
                        const node = ticketRef.current;
                        if (!node) return;

                        console.log("Starting ticket capture process...");
                        
                        // Wait for ticket to be ready with extended timeout and retries
                        const ready = await waitForTicketReady(node, 5000, 3);
                        console.log("Ticket ready status:", ready);
                        
                        if (!ready) {
                          toast.warning("Logo may not have loaded completely. Sending ticket anyway...");
                        }

                        // Add extra delay to ensure everything is rendered
                        await new Promise(r => setTimeout(r, 1000)); // Increased delay

                        // Check if logo is actually loaded
                        const logoImg = node.querySelector('img');
                        if (logoImg) {
                          console.log("Logo element found:", logoImg.src);
                          console.log("Logo natural dimensions:", logoImg.naturalWidth, "x", logoImg.naturalHeight);
                          console.log("Logo display dimensions:", logoImg.width, "x", logoImg.height);
                          
                          // Wait a bit more if logo isn't fully loaded
                          if (logoImg.naturalWidth === 0) {
                            console.log("Logo not fully loaded, waiting extra time...");
                            await new Promise(r => setTimeout(r, 2000));
                          }
                        }

                        // Temporarily override the root font-family to avoid html-to-image trying
                        // to read cross-origin font CSS rules (fonts.googleapis.com) which causes
                        // a SecurityError when accessing cssRules. This forces a system font during
                        // capture and avoids embedding remote fonts.
                        const originalFont = node.style.fontFamily;
                        try {
                          node.style.fontFamily =
                            'Arial, Roboto, system-ui, -apple-system, "Segoe UI", sans-serif';

                          // Use JPEG with higher quality and better settings
                          // wait for webfonts to finish loading (if any), then a short delay
                          if (document.fonts && document.fonts.ready)
                            await document.fonts.ready;
                          await new Promise((r) => setTimeout(r, 1000)); // Increased delay

                          console.log("Starting image capture...");
                          
                          // Force a 320px-wide exported image (intrinsic pixel width = 320)
                          // so that when pasted into Word it measures correctly.
                          // Use pixelRatio:1 to avoid high-DPI scaling (Word assumes 96 DPI).
                          const dataUrl = await toJpeg(node, {
                            quality: 0.95, // Slightly higher quality
                            backgroundColor: "#ffffff",
                            width: 330,
                            height: node.offsetHeight, // Explicitly set height
                            pixelRatio: 2,
                            cacheBust: true, // Force fresh capture
                            filter: (_node) => {
                              // Ensure we don't filter out the logo
                              return true;
                            }
                          });
                          
                          console.log("Image captured successfully, length:", dataUrl.length);
                          // Send the generated image directly to the backend email endpoint
                          // after you have data.ticketId and dataUrl (from html-to-image)
                          try {
                            setEmailSending(true);
                            const emailResp = await fetch(
                              `${API_BASE}/api/tickets/email`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ticketId: data.ticketId,
                                  to: email,
                                  imageDataUrl: dataUrl,
                                }),
                              }
                            );

                            if (!emailResp.ok) {
                              const errBody = await emailResp
                                .json()
                                .catch(() => ({}));
                              const msg =
                                errBody?.error ||
                                `Email failed (${emailResp.status})`;
                              toast.error(`Failed to send email: ${msg}`);
                            } else {
                              toast.success(`Ticket emailed to ${email}`);
                            }
                          } finally {
                            setEmailSending(false);
                          }
                        } finally {
                          // restore original font
                          try {
                            node.style.fontFamily = originalFont || "";
                          } catch (e) {
                            /* ignore */
                          }
                        }
                      } catch (e) {
                        console.error("capture/send image failed", e);
                      }
                    }, 500); // Increased initial delay
                  } catch (err: any) {
                    setError(err.message || "Unknown error");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-blue-700  text-white px-10 font-bold py-1 rounded-md cursor-pointer hover:scale-105 hover:bg-blue-600 duration-300 transition-all  "
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Ticket"}
              </button>
            </div>
          </div>
        )}
        {/* Show error message if ticket generation failed */}
        {error && (
          <div className="max-w-[800px] mx-auto mt-4">
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}
        {step === 5 && generated && ticketId && dateIssued && (
          <div className=" mt-4 sm:mt-2 sm:mb-0 mb-5 ">
            <Ticket
              amount={`₦${amount || 300}`}
              ticketId={ticketId}
              dateIssued={dateIssued}
              rootRef={ticketRef}
            />
            <div className="mt-3 flex justify-center gap-3">
              <button
                onClick={async () => {
                  try {
                    console.log("Starting resend process...");
                    const node = ticketRef.current;
                    if (!node) {
                      toast.error("Ticket view not ready to resend");
                      return;
                    }
                    
                    // Wait for ticket to be ready with extended timeout and retries
                    const ready = await waitForTicketReady(node, 5000, 3);
                    console.log("Resend - Ticket ready status:", ready);
                    
                    if (!ready) {
                      toast.warning("Logo may not have loaded completely. Resending anyway...");
                    }
                    
                    // Add extra delay to ensure everything is rendered
                    await new Promise(r => setTimeout(r, 1000));
                    
                    // Check if logo is actually loaded
                    const logoImg = node.querySelector('img');
                    if (logoImg) {
                      console.log("Resend - Logo element found:", logoImg.src);
                      console.log("Resend - Logo natural dimensions:", logoImg.naturalWidth, "x", logoImg.naturalHeight);
                      
                      // Wait a bit more if logo isn't fully loaded
                      if (logoImg.naturalWidth === 0) {
                        console.log("Resend - Logo not fully loaded, waiting extra time...");
                        await new Promise(r => setTimeout(r, 2000));
                      }
                    }
                    
                    setEmailSending(true);
                    const originalFont = node.style.fontFamily;
                    try {
                      node.style.fontFamily = 'Arial, Roboto, system-ui, -apple-system, "Segoe UI", sans-serif';
                      if (document.fonts && document.fonts.ready) await document.fonts.ready;
                      await new Promise((r) => setTimeout(r, 1000));
                      
                      console.log("Resend - Starting image capture...");
                      
                      const dataUrl = await toJpeg(node, {
                        quality: 0.95, // Higher quality
                        backgroundColor: "#ffffff",
                        width: 330,
                        height: node.offsetHeight, // Explicitly set height
                        pixelRatio: 2,
                        cacheBust: true, // Force fresh capture
                        filter: (_node) => {
                          // Ensure we don't filter out the logo
                          return true;
                        }
                      });
                      
                      console.log("Resend - Image captured successfully, length:", dataUrl.length);
                      const resp = await fetch(`${API_BASE}/api/tickets/email`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ticketId, to: email, imageDataUrl: dataUrl }),
                      });
                      if (!resp.ok) {
                        const body = await resp.json().catch(() => ({}));
                        toast.error(body?.error || `Email failed (${resp.status})`);
                      } else {
                        toast.success(`Ticket resent to ${email}`);
                      }
                    } finally {
                      try { node.style.fontFamily = originalFont || ""; } catch {}
                      setEmailSending(false);
                    }
                  } catch (e) {
                    console.error("resend failed", e);
                    toast.error("Resend failed");
                  }
                }}
                className="bg-gray-100 cursor-pointer text-gray-800 text-[14px] sm:text-[16px] px-2 sm:px-4 py-2 rounded-md"
              >
                Resend Email
              </button>
              <button
                type="button"
                className="bg-blue-700 text-white text-[14px] sm:text-[16px]  px-2 sm:px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer hover:scale-105 duration-300 transition-all"
                onClick={() => {
                  // clear all form and ticket state so we can start a new flow
                  setGenerated(false);
                  setTicketId(null);
                  setDateIssued(null);
                  setAmount("");
                  setEmail("");
                  setPhone("");
                  setStep(MIN_STEP);
                  try {
                    if (typeof window !== "undefined" && window.localStorage)
                      window.localStorage.removeItem(STORAGE_KEY);
                  } catch (e) {
                    /* ignore */
                  }
                }}
              >
                Generate new ticket
              </button>
            </div>
          </div>
        )}
        {/* Email status */}
        {step === 5 && (
          <div className="max-w-[800px] mx-auto mt-4 text-center">
            {emailSending && (
              <p className="text-blue-700">Sending ticket to {email}...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default tickets;
