export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-visible bg-zinc-50 font-sans dark:bg-black">
      <div className="absolute inset-0 bg-[url('/eats.png')] bg-contain bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-black/35" />
      <main className="items-center justify-between" />
    </div>
  );
}
