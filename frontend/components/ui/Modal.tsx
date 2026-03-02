import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
};

export default function Modal({ open, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div>
      {title ? <h2>{title}</h2> : null}
      <div>{children}</div>
    </div>
  );
}
