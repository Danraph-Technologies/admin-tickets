import { Ticket } from "lucide-react";
import Navbar from "../components/navbar";
import { Link } from "react-router-dom";
function home() {
  return (
    <div className="">
      <Navbar />
      <section className="px-2">
        <div className="flex flex-col items-center justify-center w-full ">
          <div className="bg-white p-5 max-w-[700px] w-full flex flex-col justify-center items-center py-10 rounded-lg  mt-10">
            <h2 className="sm:text-[35px] text-[22px] font-semibold ">
              Ready for an Amazing Ride ?
            </h2>
            <p className="text-gray-500">
              Join other who are already enjoying the experience
            </p>
            <Link to="/tickets">
              <button className=" hover:bg-blue-600 duration-300 transition-all hover:scale-105 cursor-pointer bg-blue-700 py-2 px-8 font-medium  sm:text-[20px] rounded-lg text-white mt-5 sm:mt-10 ">
                <span className="flex justify-center items-center gap-3">
                  <span>
                    <Ticket />
                  </span>
                  <span>Generate Ticket</span>
                </span>
              </button>
            </Link>
          </div>

          <div className="bg-white rounded-lg px-3 py-5 my-10 w-full max-w-[1100px] ">
            <div className="flex flex-col justify-center items-center">
              <h2 className="sm:text-[30px] text-[20px] font-semibold ">
                How it works
              </h2>
              <p className="text-gray-500">Generate Your tickets In Seconds</p>
            </div>
            <div>
              <div className="py-5 grid sm:grid-cols-3 grid-cols-1 gap-5 ">
                <div className=" border border-gray-400 px-3 py-5 rounded-lg shadow-lg hover:shadow-blue-400 duration-300 transition-all flex gap-2 ">
                  <div>
                    <p className="bg-blue-700 text-white rounded-full w-[30px] h-[30px] flex justify-center items-center font-medium">
                      1
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[20px] font-semibold ">
                      Click Generate Ticket
                    </h3>
                    <p className="text-gray-500 text-[14px] ">
                      Start by clicking the 'Generate Your Ticket' button above
                    </p>
                  </div>
                </div>

                <div className=" border border-gray-400 px-3 py-5 rounded-lg shadow-lg hover:shadow-blue-400 duration-300 transition-all flex gap-2 ">
                  <div>
                    <p className="bg-blue-700 text-white rounded-full w-[30px] h-[30px] flex justify-center items-center font-medium">
                      2
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[20px] font-semibold ">Enter Amount</h3>
                    <p className="text-gray-500 text-[14px] ">
                      Specify the amount you wish to pay. This amount will
                      represent the value of your ticket during validation.
                    </p>
                  </div>
                </div>

                <div className=" border border-gray-400 px-3 py-5 rounded-lg shadow-lg hover:shadow-blue-400 duration-300 transition-all flex gap-2 ">
                  <div>
                    <p className="bg-blue-700 text-white rounded-full w-[30px] h-[30px] flex justify-center items-center font-medium">
                      3
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[20px] font-semibold ">
                      Add Your Details
                    </h3>
                    <p className="text-gray-500 text-[14px] ">
                      Enter your email address and phone number to receive your
                      ticket
                    </p>
                  </div>
                </div>

                <div className=" border border-gray-400 px-3 py-5 rounded-lg shadow-lg hover:shadow-blue-400 duration-300 transition-all flex gap-2 ">
                  <div>
                    <p className="bg-blue-700 text-white rounded-full w-[30px] h-[30px] flex justify-center items-center font-medium">
                      4
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[20px] font-semibold ">
                      Choose Payment Method
                    </h3>
                    <p className="text-gray-500 text-[14px] ">
                      Select your preferred payment method from available
                      options
                    </p>
                  </div>
                </div>

                <div className=" border border-gray-400 px-3 py-5 rounded-lg shadow-lg hover:shadow-blue-400 duration-300 transition-all flex gap-2 ">
                  <div>
                    <p className="bg-blue-700 text-white rounded-full w-[30px] h-[30px] flex justify-center items-center font-medium">
                      5
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[20px] font-semibold ">
                      Complete Payment
                    </h3>
                    <p className="text-gray-500 text-[14px] ">
                      Securely pay for your tickets using your chosen payment
                      method
                    </p>
                  </div>
                </div>

                <div className=" border border-gray-400 px-3 py-5 rounded-lg shadow-lg hover:shadow-blue-400 duration-300 transition-all flex gap-2 ">
                  <div>
                    <p className="bg-blue-700 text-white rounded-full w-[30px] h-[30px] flex justify-center items-center font-medium">
                      6
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[20px] font-semibold ">
                      Recieve Your Ticket
                    </h3>
                    <p className="text-gray-500 text-[14px] ">
                      Once confirmed, your ticket is generated and sent to your
                      email instantly
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Link to="/tickets">
                  <button className=" hover:bg-blue-600 duration-300 transition-all hover:scale-105 cursor-pointer bg-blue-700 py-2 px-8 font-medium  sm:text-[20px] rounded-lg text-white mt-5 sm:mt-10 ">
                    <span className="flex justify-center items-center gap-3">
                      <span>
                        <Ticket />
                      </span>
                      <span>Generate Now</span>
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default home;
