function Button({
  children,
  variant = "default",
  size = "md",
  onClick,
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const variants = {
    default: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400",
    outline:
      "border border-gray-700 text-gray-300 hover:bg-gray-800 focus:ring-gray-500",
    ghost: "text-gray-300 hover:bg-gray-800 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export { Button };
