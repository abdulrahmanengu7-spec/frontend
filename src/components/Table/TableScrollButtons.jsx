.table-area {
  position: relative;
}

/* Table scroll container */
.table-scroll-box {
  max-height: calc(100vh - 230px);
  overflow: auto;
  position: relative;
  scroll-behavior: smooth;
}

/* Buttons wrapper — no background shape */
.table-scroll-tools {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 80;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  backdrop-filter: none !important;
}

/* Professional light buttons */
.table-scroll-tools button {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(189, 16, 23, 0.18);
  border-radius: 50%;
  background: #ffffff;
  color: #bd1017;
  display: grid;
  place-items: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.14),
    0 0 0 4px rgba(255, 255, 255, 0.65);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.table-scroll-tools button:hover {
  background: #fff5f5;
  color: #991b1b;
  transform: translateY(-2px);
  box-shadow:
    0 12px 26px rgba(15, 23, 42, 0.18),
    0 0 0 4px rgba(255, 255, 255, 0.85);
}

.table-scroll-tools button:active {
  transform: scale(0.94);
}

/* Dark mode */
:root[data-theme="dark"] .table-scroll-tools {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

:root[data-theme="dark"] .table-scroll-tools button {
  background: #f8fafc;
  color: #bd1017;
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.35),
    0 0 0 4px rgba(15, 23, 42, 0.25);
}

:root[data-theme="dark"] .table-scroll-tools button:hover {
  background: #ffffff;
  color: #991b1b;
}

/* Mobile */
@media (max-width: 768px) {
  .table-scroll-box {
    max-height: calc(100vh - 260px);
  }

  .table-scroll-tools {
    right: 10px;
    bottom: 10px;
    gap: 8px;
  }

  .table-scroll-tools button {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }
}
