import { CheckCircleOutlined, CheckCircleTwoTone } from "@ant-design/icons";

export interface ActionButtonProps {
  color: string;
  background: string;
  icon?: string;
  checked?: boolean;
  children: any;
  onClick?: () => any;
  variant?: string;
}

export default function ActionButton({
  color,
  background,
  icon,
  checked = false,
  children,
  onClick,
  variant = "button",
}: ActionButtonProps) {
  if (variant == "circle") {
    return (
      <div
        className={
          (checked ? "" : "opacity-60") +
          " hover:cursor-pointer hover:opacity-80 transition"
        }
      >
        <div className="flex justify-center">
          <div
            className="rounded-full p-4 flex justify-center items-center mb-1"
            style={{
              color,
              background,
            }}
            onClick={onClick}
          >
            {icon && (
              <div>
                <img src={icon} style={{ height: 40 }} />
              </div>
            )}
          </div>
        </div>

        <div className="truncate text-center">
          {checked && <CheckCircleOutlined style={{ color: "#7FFFD4" }} />}{" "}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-3 px-4 flex items-center transition hover:cursor-pointer hover:scale-105"
      style={{
        color,
        background,
        maxWidth: 480,
      }}
      onClick={onClick}
    >
      {icon && (
        <div className="mr-3">
          <img src={icon} style={{ height: 28 }} />
        </div>
      )}

      <div className="truncate flex grow">{children}</div>

      {checked && (
        <div className="ml-3">
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} />
        </div>
      )}
    </div>
  );
}
