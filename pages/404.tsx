export default function Custom404() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0f172a] px-6 text-center text-white">
      <p className="text-sm uppercase tracking-[0.3em] text-sky-300">404</p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="max-w-md text-sm text-slate-300">
        The page you requested does not exist or may have moved.
      </p>
    </div>
  );
}
