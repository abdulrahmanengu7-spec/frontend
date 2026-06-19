import "./Input.css";
export default function Input({ icon, rightElement, className = "", ...props }) {
  return (
    <label className={`input-wrap ${className}`}>
      {icon && <span className="input-icon">{icon}</span>}
      <input {...props} />
      {rightElement && <span className="input-right">{rightElement}</span>}
    </label>
  );
}
