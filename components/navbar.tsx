import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="bg-black text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link href="/">
          <h1>Logo</h1>
        </Link>
      </div>
      <div className="flex space-x-6 items-center">
        <Link href="/posts">
          <h1 className="hover:underline">Innlegg</h1>
        </Link>
        <Link href="/nyheter">
          <h1 className="hover:underline">Nyheter</h1>
        </Link>
        <Link href="/prosjekter">
          <h1 className="hover:underline">Prosjekter</h1>
        </Link>
        <Link href="/login">
          <h1 className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-300">Login</h1>
        </Link>
      </div>
    </div>
  );
}
