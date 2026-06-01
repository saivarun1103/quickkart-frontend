const DownloadIcon = ({
  size = 20,
  className = "",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M12 16a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L11 12.59V4a1 1 0 1 1 2 0v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4A1 1 0 0 1 12 16Z" />
    <path d="M5 19a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2Z" />
  </svg>
);

export default DownloadIcon;