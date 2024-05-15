import { Checkbox, Modal, message } from "antd";
import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { useNetwork } from "wagmi";
import { ConfirmRegistationDomainCard } from "./ConfirmRegistationDomainCard";

export default function RegisterConfirmationModal({
  show,
  onClose,
  onConfirm,
  state,
  chainId,
  domainName,
  domainDisplayName,
}: any) {
  const { chains } = useNetwork();
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [asPrimary, setAsPrimary] = useState(true);

  const handleOk = useCallback(async () => {
    if (!acceptPolicy) {
      message.warning(
        "Please acknowledge that your social profile and wallet connection details will be made public, stored, and verifiable in the blockchain."
      );
      return;
    }

    let timeout;

    try {
      setRegistering(true);
      timeout = setTimeout(() => setRegistering(false), 30000);
      await onConfirm(asPrimary);
    } catch (err) {
      console.error(err);
    } finally {
      setRegistering(false);
      clearTimeout(timeout);
    }
  }, [acceptPolicy, state, onConfirm]);

  return (
    <Modal
      title="Confirm Registration"
      open={show}
      onOk={handleOk}
      onCancel={onClose}
      footer={[
        <div
          onClick={handleOk}
          className={
            "w-full text-center text-lg bg-amber-600 p-3 rounded-xl hover:cursor-pointer transition hover:scale-105 glowing-btn" +
            (registering ? " pointer-events-none opacity-80" : "")
          }
        >
          {registering ? "Registering..." : "Register Domain"}
        </div>,
        <div
          className={
            "w-full p-3 hover:cursor-pointer text-center mt-3 border-[#333741] border rounded-lg bg-[#161B26]" +
            (registering ? " hidden" : "")
          }
          onClick={onClose}
        >
          Cancel
        </div>,
      ]}
    >
      <div className="mb-4 mt-4">
        <ConfirmRegistationDomainCard
          domainChainId={
            chainId ?? parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID!)
          }
          domainName={domainName}
          domainDisplayName={domainDisplayName}
          inputProfiles={state.map((x: any) => ({
            ...x,
            node: ethers.utils.namehash(domainName),
            chainId:
              chainId ?? parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID!),
            uid: "",
          }))}
          oneColumn={true}
        />
      </div>

      <div className="mb-3">
        <Checkbox
          checked={asPrimary}
          onChange={(e) => setAsPrimary(e.target.checked)}
        >
          Set {domainDisplayName} as primary domain on{" "}
          {chains.find((x) => x.id == chainId)?.name}
        </Checkbox>
      </div>

      <div className="mb-4">
        <Checkbox
          checked={acceptPolicy}
          onChange={(e) => setAcceptPolicy(e.target.checked)}
        >
          I acknowledge that my social profiles and wallet connection details
          will be made public, stored, and verifiable in the blockchain, and I
          understand that any third party can use my connection details without
          requiring permission for any purpose.
        </Checkbox>
      </div>
    </Modal>
  );
}
