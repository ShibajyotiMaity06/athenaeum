export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  /* Public corridor — catalogue and previews are open to every visitor.
     Full codices seal themselves server-side until Scholar access exists. */
  return <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">{children}</div>;
}
