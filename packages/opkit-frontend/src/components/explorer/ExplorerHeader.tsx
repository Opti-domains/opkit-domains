import React from "react"

export default function ExplorerHeader() {
  return (
    <div className="flex justify-between items-center mx-auto container p-4 py-6">
      <a href="/">
        <div className="flex items-center">
          <img src={"/infinity-op-circle.png"} className="mr-3" style={{ width: 48, height: 48 }} />
          <div className="text-xl font-semibold">Opti.Domains</div>
        </div>
      </a>

      <div className="hidden sm:block">
        <div>
          <a href="/">
            <div className="flex w-fit space-x-2 rounded-2xl bg-amber-600 px-4 py-3 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-[1px] hover:bg-amber-700">
              <span>Mint Now</span> 
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}