const variantClasses = {
  primary:
    "bg-orange text-white hover:bg-orangeDark active:bg-orangeDark border border-transparent",
  secondary:
    "bg-teal text-white hover:brightness-95 active:brightness-90 border border-transparent",
  outline:
    "bg-transparent text-orange border border-orange hover:bg-orangeLight active:bg-orangeLight",
};

function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  const classes = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`min-h-[52px] rounded-xl px-6 font-heading text-base font-medium normal-case transition-all duration-150 active:scale-[0.98] ${classes} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
