import { Skeleton } from "antd";
import React, { useState } from "react"
import ExplorerHeader from "src/components/explorer/ExplorerHeader";
import { useOptidomainsStat } from "src/hooks/useOptidomainsStat";

export default function ExplorerPage() {
  const [ stat, isStatLoading ] = useOptidomainsStat();

  return (
    <div className="min-h-screen bg-red-900 text-white selection:bg-indigo-500 selection:text-white">
      <ExplorerHeader />

      <div className="container relative z-20 mx-auto grid grid-cols-1 gap-x-4 gap-y-20 py-4 px-4">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-red-950 p-4 shadow-lg">
            <div className="text-2xl xl:text-4xl text-amber-200 mb-2 xl:mb-3">Attestations</div>
            <div className="text-4xl xl:text-6xl">
              {stat ? stat.totalAttestations : <Skeleton active></Skeleton>}
            </div>
          </div>

          <div className="rounded-xl bg-red-950 p-4 shadow-lg">
            <div className="text-2xl xl:text-4xl text-amber-200 mb-2 xl:mb-3">Unique Attestors</div>
            <div className="text-4xl xl:text-6xl">
              {stat ? stat.uniqueAttestors : <Skeleton active></Skeleton>}
            </div>
          </div>

          <div className="rounded-xl bg-red-950 p-4 shadow-lg">
            <div className="text-2xl xl:text-4xl text-amber-200 mb-2 xl:mb-3">Unique Holders</div>
            <div className="text-4xl xl:text-6xl">
              {stat ? stat.uniqueHolders : <Skeleton active></Skeleton>}
            </div>
          </div>
        </div>

        <div>

        </div>
      </div>
    </div>
  )
}