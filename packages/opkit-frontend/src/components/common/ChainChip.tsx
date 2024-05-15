interface ChainChipProps {
  amount: number;
}
export const ChainChip = ({ amount }: ChainChipProps) => {
  return (
    <div className="pl-1.5 pr-3 py-1 bg-[#161B26] border border-[#333741] flex gap-1.5 rounded-full items-center">
      <img src="/images/chains/op.png" className="w-4 h-4" alt="" />
      <div className="text-[#F5F5F6] text-sm">+{amount}</div>
    </div>
  );
};
