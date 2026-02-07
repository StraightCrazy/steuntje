"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
};

export default function ShareButton({ text }: Props) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanShare(true);
    }
  }, []);

  function delen() {
    if (!canShare) return;

    navigator.share({
      title: "Steuntje",
      text,
      url: window.location.href,
    });
  }

  if (!canShare) {
    return null;
  }

  return (
    <div className="share-wrapper">
      <button onClick={delen} className="share-button" type="button">
        Delen
      </button>
      <span className="share-feedback">
        Deel dit steuntje met iemand die het kan gebruiken
      </span>
    </div>
  );
}
