const InfoIcon = ({
  size = 20,
  className = "",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <circle cx="12" cy="7" r="1.3" fill="white" />
    <rect x="11" y="10" width="2" height="8" rx="1" fill="white" />
  </svg>
);
export default InfoIcon;