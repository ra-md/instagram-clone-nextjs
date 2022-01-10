export function TextField({ className, ...props }) {
  return (
    <input
      className={`bg-gray-100 py-1.5 px-3 border border-gray-300 rounded-md w-full ${className}`}
      {...props}
    />
  );
}
