export function LegalFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-5 pb-24 pt-6 text-slate-400 md:pb-6">
      <div className="mx-auto max-w-7xl space-y-2 text-xs leading-5">
        <p>
          LEGO® catalogue data supplied by{" "}
          <a
            href="https://rebrickable.com/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-slate-200 underline decoration-slate-600 underline-offset-2 hover:text-white"
          >
            Rebrickable
          </a>
          .
        </p>
        <p>
          LEGO® is a trademark of the LEGO Group of companies, which does not
          sponsor, authorize or endorse TBX. TBX is an independent marketplace.
        </p>
      </div>
    </footer>
  );
}
