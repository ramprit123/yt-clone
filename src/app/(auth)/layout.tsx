import type { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex size-full items-center justify-center">{children}</div>
  );
};

export default AuthLayout;
