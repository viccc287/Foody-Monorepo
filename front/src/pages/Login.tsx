import LoginForm from "@/components/LoginForm.tsx";
import { X } from "lucide-react";

import foodyText from "/foodytext.svg";
import restaurantLogo from "/restaurantlogo.jpg";
import background from "/background.webp";

export default function Login() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 w-full h-full lg:pe-12 ">
      {/* Left section with background */}
      <div className="w-full lg:w-2/3 h-48 lg:h-full bg-gray-100 relative p-24 rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${background})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40">
            <div className="p-6 lg:p-12 text-white h-full flex flex-col justify-center gap-6 items-center lg:items-start">
              <img src={foodyText} className="w-[25vw] max-w-[350px]" />
              <p className="text-sm lg:text-xl text-gray-200 font-light text-pretty">
                El sistema de gestión de restaurante a tu alcance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right section with login */}
      <div className="grow flex flex-col items-center justify-center px-4 lg:px-0 py-8 lg:py-0 h-full gap-8 lg:gap-12">
        <div className="flex gap-4 lg:gap-8 items-center">
          <img
            src="foodylogo.webp"
            className="rounded-full w-20 h-20 lg:size-32"
          />
          <X className="w-8 h-8 lg:size-12" />
          <img
            src={restaurantLogo}
            className="rounded-full w-20 h-20 lg:size-32"
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
