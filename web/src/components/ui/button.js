import { Spinner } from "../ui/spinner";

const sizeOptions = {
  sm: "py-1 px-2 text-sm",
  md: "py-1 px-3 font-semibold",
};

export function Button({
  isLoading,
  children,
  className,
  size = "md",
  ...props
}) {
  return (
    <button
      className={`rounded-md flex justify-center disabled:cursor-not-allowed ${sizeOptions[size]} ${className} `}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
