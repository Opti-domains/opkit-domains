import { useCallback, useEffect, useState } from "react";
import ActionButton, { ActionButtonProps } from "./ActionButton";
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, message } from "antd";
import axios from "axios";
import { useAccount, useNetwork } from "wagmi";

export interface QuestButtonProps extends ActionButtonProps {
  endpoint: string;
  endpointBody?: any;
  onPassed: () => any;
  onClick: () => any;
  children: any;
}

export default function QuestButton({ children, endpoint, onPassed, onClick, endpointBody = {}, ...props }: QuestButtonProps) {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const [loading, setLoading] = useState(false);
  const [passed, setPassed] = useState(false);

  const spinning = <LoadingOutlined style={{ fontSize: 24, color: props.color }} spin />;

  const verify = useCallback(async (silent: boolean = false) => {
    try {
      setLoading(true)

      const response = await axios.post(endpoint, endpointBody, {
        withCredentials: true,
      })

      if (response.data.passed) {
        if (!silent) message.success(response.data.message)
        setPassed(true)
      } else {
        if (!silent) message.error(response.data.message)
        setPassed(false)
      }
    } catch (err: any) {
      console.error(err)
      if (err.response?.data?.message) {
        if (!silent) message.error(err.response?.data?.message)
      } else {
        if (!silent) message.error("Unknown verification error")
      }
      setPassed(false)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    setPassed(false)
    verify(true)
  }, [endpoint, address, isConnected, chain])

  useEffect(() => {
    if (passed) {
      onPassed()
    }
  }, [passed])

  return (
    <ActionButton {...props} checked={passed} onClick={onClick}>
      <div className="flex justify-between items-center grow">
        <div>{children}</div>

        {!passed && (
          loading ? (
            <div className="">
              <Spin indicator={spinning} />
            </div>
          ) : (
            <div className="" onClick={(e) => {
              e.stopPropagation()
              verify()
            }}>
              <div className="rounded-md bg-red-950 p-1.5 px-3 hover:cursor-pointer hover:opacity-90 text-sm text-white">
                Verify
              </div>
            </div>
          )
        )}
      </div>
    </ActionButton>
  );
}
