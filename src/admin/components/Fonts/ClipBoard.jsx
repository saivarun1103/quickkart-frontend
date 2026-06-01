const ClipboardIcon = ({
  size = 20,
  className = "",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    className={className}
  >
    {/* Clipboard body */}
    <rect
      x="72"
      y="96"
      width="368"
      height="384"
      rx="16"
      fill="#21974c"
      opacity="0.2"
    />

    {/* Paper */}
    <rect
      x="116"
      y="96"
      width="280"
      height="340"
      rx="12"
      fill="#ffffff"
    />

    {/* Clip */}
    <rect
      x="180"
      y="74"
      width="150"
      height="44"
      rx="12"
      fill="#21974c"
    />

    {/* Top ring */}
    <path
      d="M256 30c-30 0-54 24-54 54h28c0-15 11-26 26-26s26 11 26 26h28c0-30-24-54-54-54z"
      fill="#21974c"
      opacity="0.8"
    />

    {/* Text lines */}
    <rect x="170" y="170" width="172" height="20" rx="10" fill="#21974c" />
    <rect x="170" y="235" width="172" height="20" rx="10" fill="#21974c" />
    <rect x="170" y="300" width="172" height="20" rx="10" fill="#21974c" />
    <rect x="170" y="365" width="120" height="20" rx="10" fill="#21974c" />
  </svg>
);

export default ClipboardIcon;