"use client";

import type { ButtonHTMLAttributes } from "react";

// A submit button that asks "are you sure?" first. Used for anything that cannot be undone.
export default function ConfirmButton({ confirm: question, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { confirm: string }) {
  return (
    <button
      type="submit"
      {...props}
      onClick={(e) => {
        if (!window.confirm(question)) e.preventDefault();
      }}
    />
  );
}
