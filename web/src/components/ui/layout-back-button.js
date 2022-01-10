import { Button } from "./button";
import { useRouter } from "next/router";

export function LayoutBackButton({ children, to }) {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col overflow-y-auto w-screen">
      <div className="px-4 py-2 sticky top-0 z-10 bg-white border-b border-gray-300 mb-4">
        <Button
          className="hover:text-red-500 bg-white text-black"
          onClick={() => router.back()}
        >
          Close
        </Button>
      </div>
      {children}
    </div>
  );
}
