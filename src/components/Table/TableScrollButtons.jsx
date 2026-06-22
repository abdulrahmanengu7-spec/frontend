import { useEffect, useState } from "react";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import "./TableScrollButtons.css";

export default function TableScrollButtons({ targetRef }) {
  const [visible, setVisible] = useState(false);

  const checkRows = () => {
    const box = targetRef?.current;
    if (!box) {
      setVisible(false);
      return;
    }

    const rowCount = box.querySelectorAll("tbody tr").length;
    setVisible(rowCount > 15);
  };

  useEffect(() => {
    checkRows();

    const box = targetRef?.current;
    if (!box) return;

    const observer = new MutationObserver(() => {
      checkRows();
    });

    observer.observe(box, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("resize", checkRows);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkRows);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef]);

  const scrollUp = () => {
    const box = targetRef?.current;
    if (!box) return;

    box.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollDown = () => {
    const box = targetRef?.current;
    if (!box) return;

    box.scrollTo({
      top: box.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <div className="table-scroll-tools" aria-label="Table scroll controls">
      <button type="button" onClick={scrollUp} title="Scroll table up">
        <FiArrowUp />
      </button>

      <button type="button" onClick={scrollDown} title="Scroll table down">
        <FiArrowDown />
      </button>
    </div>
  );
}
