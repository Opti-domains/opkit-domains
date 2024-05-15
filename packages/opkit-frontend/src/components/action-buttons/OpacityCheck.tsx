import React, { ReactNode } from "react";

export default function OpacityCheck({
  active,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <span style={{ opacity: active ? 1 : 0.3 }}>✓</span>&nbsp;&nbsp;{children}
    </div>
  );
}
