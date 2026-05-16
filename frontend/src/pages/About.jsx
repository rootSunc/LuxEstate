import {
  FaCloudUploadAlt,
  FaCodeBranch,
  FaLock,
  FaRegComments,
  FaSearch,
  FaShieldAlt,
} from "react-icons/fa";

const productPillars = [
  {
    icon: FaSearch,
    title: "Search-led discovery",
    description:
      "Renters and buyers can browse curated inventory, refine results by property type and amenities, and compare listings from a focused marketplace view.",
  },
  {
    icon: FaCloudUploadAlt,
    title: "Owner publishing workflow",
    description:
      "Authenticated owners can create and update listings with structured pricing, amenities, descriptions, and up to six validated property images.",
  },
  {
    icon: FaRegComments,
    title: "Inquiry management",
    description:
      "Interested users can contact owners from listing detail pages, while owners manage incoming messages from a lightweight profile dashboard.",
  },
];

const engineeringNotes = [
  "HTTP-only JWT session cookies for safer browser authentication.",
  "Firebase Google sign-in verification before local session creation.",
  "Mongoose persistence models for users, listings, and inquiries.",
  "Image MIME, binary signature, and size validation before upload storage.",
  "Vitest contracts, frontend lint/build checks, npm audit, and GitHub Actions CI.",
];

export default function About() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="mb-3 text-sm font-semibold uppercase text-emerald-700">
            About LuxEstate
          </p>
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                A full-stack real estate marketplace built for realistic product workflows.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                LuxEstate is a portfolio-grade marketplace demo that brings together
                listing discovery, authenticated publishing, safe image uploads,
                and owner inquiry management in one cohesive application.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <FaCodeBranch />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Stack</p>
                  <p className="font-semibold text-slate-900">
                    React, Express, MongoDB, Vite
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                The project is intentionally scoped as a compact but production-minded
                full-stack system, with clear API boundaries and repeatable local setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-950">
            What the product demonstrates
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            The core experience is designed around the actions a real property
            marketplace must support from both sides of the transaction.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {productPillars.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                <Icon />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="mb-3 flex items-center gap-2 text-slate-950">
              <FaShieldAlt className="text-emerald-700" />
              <h2 className="text-2xl font-semibold">Engineering focus</h2>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              LuxEstate favors practical engineering decisions over decorative
              complexity: typed validation boundaries, secure session behavior,
              predictable data models, and automated checks that can run locally
              or in CI.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <ul className="grid gap-3">
              {engineeringNotes.map((note) => (
                <li key={note} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <FaLock className="mt-1 shrink-0 text-slate-500" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
