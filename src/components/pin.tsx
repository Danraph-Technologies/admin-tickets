import { useState } from "react";

interface PinProps {
  onSubmit: (pin: string) => void;
  onClose?: () => void;
}

function Pin({ onSubmit, onClose }: PinProps) {
  const [pin, setPin] = useState("");

  return (
    <div className="border-2 p-5  rounded-lg max-w-[360px] w-full">
      <div>
        <h1 className="text-[20px] font-semibold ">Enter Pin to continue</h1>
      </div>
      <div className="flex flex-col py-3 ">
        <input
          type="password"
          name="pin"
          id="pin-input"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full outline-none border-2 px-2 rounded-lg  "
          autoFocus
        />
      </div>
      <div className="flex justify-center items-center gap-3">
        <button
          onClick={() => onSubmit(pin)}
          className="bg-white text-black px-5 py-1 rounded-lg hover:bg-gray-200 duration-300 hover:scale-105 cursor-pointer transition-all "
        >
          Verify
        </button>
        <button
          onClick={() => onClose && onClose()}
          className="bg-gray-200 text-black px-4 py-1 rounded-lg hover:bg-gray-300 duration-200 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Pin;
