import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import "./TableScrollButtons.css";

export default function TableScrollButtons({ targetRef }) {
  const scrollTop = () => {
    targetRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollBottom = () => {
    const el = targetRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="table-scroll-tools">
      <button type="button" onClick={scrollTop} title="Table Scroll Up">
        <FiArrowUp />
      </button>

      <button type="button" onClick={scrollBottom} title="Table Scroll Down">
        <FiArrowDown />
      </button>
    </div>
  );
}
