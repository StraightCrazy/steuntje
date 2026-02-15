"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  text: string;
};

export default function ShareButton({ text }: Props) {
  const [canShare, setCanShare] = useState(false);
  const t = useTranslations("share"); // 🔥 NIEUW

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanShare(true);
    }
  }, []);

  function delen() {
    if (!canShare) return;

    navigator.share({
      title: t("title"), // 🔥 vertaald
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
        {t("button")}
      </button>

      <span className="share-feedback">
        {t("feedback")}
      </span>
    </div>
  );
}
