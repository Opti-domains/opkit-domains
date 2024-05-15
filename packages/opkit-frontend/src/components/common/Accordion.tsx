import { ReactNode, useEffect, useState } from "react";
import useAccountSiwe from "src/hooks/useAccountSiwe";

interface AccordionProps {
  title: string;
  subtitle: string;
  number: string;
  children: ReactNode;
}
export const Accordion = ({
  title,
  children,
  number,
  subtitle,
}: AccordionProps) => {
  const { address, isConnected } = useAccountSiwe();
  const [isOpen, setIsOpen] = useState(!!isConnected);
  useEffect(() => {
    setIsOpen(!!isConnected);
  }, [isConnected, address]);
  return (
    <div className="text-white w-full">
      <div className="w-full text-left border border-[#D0D5DD] bg-white rounded-xl p-6 transition-all">
        <div className="flex justify-between items-center">
          <div className="text-lg text-[#101828] font-semibold flex gap-3">
            <div className="bg-[#0C111D] text-white w-9 h-9 rounded-full flex justify-center items-center">
              {number}.
            </div>
            <div>
              <div>{title}</div>
              <div className={`text-base text-[#344054] font-normal`}>
                {subtitle}
              </div>
            </div>
          </div>
          <svg
            className={`transform transition-transform duration-500 ${
              isOpen ? "" : "rotate-180"
            }`}
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 12L16 20L24 12"
              stroke="#94969C"
              stroke-width="1.66667"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div
          className={`${isOpen ? "block" : "hidden"} text-base text-[#344054]`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
