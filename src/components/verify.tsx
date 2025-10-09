import { Check, X } from "lucide-react";
import Pin from "./pin";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

function Verify() {
  const [pinOpen, setPinOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<any | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'used' | 'fake'>('idle');
  const [debug, setDebug] = useState<{ url?: string; status?: number; statusText?: string; body?: any } | null>(null);

  // Do NOT persist verification across reloads — verification resets on page load.

  const handlePinSubmit = (pin: string) => {
    if (pin === "1980") {
      setVerified(true);
      setPinOpen(false);
      toast.success("Verified.");
    } else {
      toast.error("Invalid PIN");
    }
  };

  const handlePinClose = () => setPinOpen(false);

  // Fetch ticket when component mounts if ticketId is present in query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('ticketId');
    if (!id) return;
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : 'https://ticket-backend-davetechinnovation1440-jgqqgsbi.leapcell.dev';
    const reqUrl = `${API_BASE}/api/tickets/${encodeURIComponent(id)}`;
    setDebug({ url: reqUrl });
    setLoading(true);
    fetch(reqUrl)
      .then(async (r) => {
        setDebug((d) => ({ ...(d || {}), status: r.status, statusText: r.statusText }));
        if (r.status === 404) {
          const text = await r.text().catch(() => '');
          setDebug((d) => ({ ...(d || {}), body: text }));
          throw new Error('not-found');
        }
        if (!r.ok) {
          const text = await r.text().catch(() => '');
          setDebug((d) => ({ ...(d || {}), body: text }));
          throw new Error('network');
        }
        const json = await r.json();
        setDebug((d) => ({ ...(d || {}), body: json }));
        return json;
      })
      .then((data) => {
        setTicket(data);
        if (data && data.used) setStatus('used');
        else setStatus('success');
      })
      .catch(() => {
        setStatus('fake');
      })
      .finally(() => setLoading(false));
  }, []);

  // Handler to mark ticket as used (invalidate)
  const handleInvalidate = async (checked: boolean) => {
    if (!ticket?.ticketId) return;
    if (!checked) return; // only handle checking (mark used)
    const confirmOk = window.confirm('Mark this ticket as invalid/used? This cannot be undone easily.');
    if (!confirmOk) return;
    try {
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : 'https://ticket-backend-davetechinnovation1440-jgqqgsbi.leapcell.dev';
      const resp = await fetch(`${API_BASE}/api/tickets/${encodeURIComponent(ticket.ticketId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ used: true }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        toast.error(body?.error || `Update failed (${resp.status})`);
        return;
      }
      const updated = await resp.json();
      setTicket(updated);
      setStatus('used');
      toast.success('Ticket marked as used');
    } catch (e) {
      console.error('invalidate failed', e);
      toast.error('Failed to mark ticket');
    }
  };

  return (
    <div className="relative">
      <Toaster richColors position="top-center" />
      <div className=" flex flex-col  font-[Playfair_Display]  text-left items-center  justify-center h-screen  ">
        {/* ticket data is fetched in useEffect on mount */}

        {/* Loading or result panels */}
        {loading && <p>Checking ticket...</p>}

        {status === 'success' && ticket && (
          <div className="border-2 p-5 border-gray-500 rounded-lg ">
          <div className="flex justify-center items-center">
            <p className="bg-green-600 w-[80px] h-[80px] rounded-full flex justify-center items-center text-white  ">
              <Check className="w-14 h-14" />
            </p>
          </div>

          <p className="text-[20px] font-semibold  ">Verification Succesful</p>
          <p className="text-semibold text-[17px] font-[Montserrat] py-1 ">
            See Ticket Details Below:
          </p>
          <div className="flex flex-col gap-3 text-left ">
            <p>
              <span>Amount:</span>{' '}
              <span>{ticket?.amount ? `₦${ticket.amount}` : '₦300'}</span>
            </p>
            <p>
              <span>Ticket ID:</span>{' '}
              <span>{ticket?.ticketId || '—'}</span>
            </p>
            <p>
              <span>Date Issued:</span>{' '}
              <span>{ticket?.dateIssued || ticket?.dateIssuedIso || new Date().toLocaleDateString()}</span>
            </p>
            <p>
              <span>Type:</span>{' '}
              <span>{ticket?.type || 'Printed'}</span>
            </p>
            <p>
              <span>Valid For:</span>{' '}
              <span>{ticket?.validFor || 'Single Trip'}</span>
            </p>

            {!verified && (
              <p className="text-[14px]">
                Are you a driver?{" "}
                <span
                  className="text-blue-600 cursor-pointer hover:text-blue-500 "
                  onClick={() => setPinOpen(true)}
                >
                  Click here{" "}
                </span>{" "}
              </p>
            )}

            {verified && (
              <p>
                <input
                  type="checkbox"
                  name="checkbox"
                  id="invalidate"
                  onChange={(e) => handleInvalidate(e.target.checked)}
                />{' '}
                Invalidate Ticket{' '}
              </p>
            )}
          </div>
          </div>
        )}

        {status === 'used' && (
          <div className="border-2 border-gray-500 p-2 rounded-lg">
            <div className="flex justify-center items-center">
              <p className="bg-red-600 w-[80px] h-[80px] rounded-full flex justify-center items-center text-white  ">
                <X className="w-14 h-14" />
              </p>
            </div>
            <p className="py-2 font-semibold ">Ticket Already Used</p>
          </div>
        )}

        {status === 'fake' && (
          <div className="border-2 border-gray-500 p-2 rounded-lg">
            <div className="flex justify-center items-center">
              <p className="bg-red-600 w-[80px] h-[80px] rounded-full flex justify-center items-center text-white  ">
                <X className="w-14 h-14" />
              </p>
            </div>
            <p className="py-2 font-semibold ">Ticket Verification failed — marked as fake</p>
          </div>
        )}
      </div>

      {/* modal overlay for PIN when open */}
      {pinOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 text-white p-4 ">
          <Pin onSubmit={handlePinSubmit} onClose={handlePinClose} />
        </div>
      )}
    </div>
  );
}

export default Verify;
