import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col p-8 md:mx-32 mx-auto">
      <h2 className="text-2xl">404 This page could not be found!</h2>
      <Link href="/" className="p-2 border-2 rounded-md my-2 w-fit">
        Go Home
      </Link>
    </div>
  );
}
