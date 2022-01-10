const padding = {
  8: "p-8",
};

export function Card({ children, className, p = 8 }) {
  return (
    <div
      className={`bg-white border border-gray-300 ${padding[p]} ${className}`}
    >
      {children}
    </div>
  );
}
