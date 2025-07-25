import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50 font-sans flex flex-col min-h-screen">
      {/* Bannière */}
      <div className="w-full bg-blue-900 text-white py-2 px-8 flex items-center justify-between text-sm">
        <div className="font-bold tracking-wide">MaSaaS</div>
        <nav className="flex gap-6">
          <a href="#" className="hover:underline">Accueil</a>
          <a href="#" className="hover:underline">À propos</a>
          <a href="#" className="hover:underline">Fonctionnalités</a>
          <a href="#" className="hover:underline">Tarifs</a>
          <a href="#" className="hover:underline">Contact</a>
        </nav>
      </div>
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-2">
            b
          </div>
          <nav className="hidden md:flex gap-6 text-blue-900 font-medium">
            <a className="hover:underline cursor-default">Product</a>
            <a className="hover:underline cursor-default">Resources</a>
            <a className="hover:underline cursor-default">Community</a>
            <a className="hover:underline cursor-default">Examples</a>
            <a className="hover:underline cursor-default">Pricing</a>
            <a className="hover:underline cursor-default">Enterprise</a>
          </nav>
        </div>
        <div className="flex gap-3 items-center">
          <button className="text-blue-900 font-medium px-4 py-2 rounded hover:bg-blue-100 cursor-default">Contact sales</button>
          <button className="text-blue-900 font-medium px-4 py-2 rounded hover:bg-blue-100 cursor-default">Log in</button>
          <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 cursor-default">Get started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 max-w-7xl mx-auto gap-12">
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight">
            Accès direct à la puissance et aux outils IA
          </h1>
          <p className="text-lg text-blue-900/80">
            Découvrez ce que l’IA peut faire pour vous, directement depuis votre navigateur.
          </p>
          <div className="flex items-center w-full max-w-xl mt-4">
            <input
              type="text"
              placeholder="Search for a template"
              className="flex-1 px-5 py-3 rounded-l-lg border border-blue-200 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled
            />
            <span className="bg-blue-600 px-4 py-3 rounded-r-lg text-white flex items-center cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          {/* Illustration abstraite */}
          <div className="w-80 h-64 bg-gradient-to-tr from-blue-200 via-yellow-200 to-red-200 rounded-3xl flex items-center justify-center relative">
            <svg width="120" height="120" className="absolute left-8 top-8">
              <circle cx="60" cy="60" r="40" fill="#2563eb" fillOpacity="0.7" />
            </svg>
            <svg width="80" height="80" className="absolute right-8 bottom-8">
              <rect width="60" height="60" rx="15" fill="#facc15" fillOpacity="0.7" />
            </svg>
            <svg width="60" height="60" className="absolute right-16 top-12">
              <polygon points="30,0 60,60 0,60" fill="#ef4444" fillOpacity="0.7" />
            </svg>
            <span className="z-10 text-5xl font-bold text-blue-900/20">IA</span>
          </div>
        </div>
      </section>

      {/* Filtres et contenu principal */}
      <section className="max-w-7xl mx-auto flex gap-8 px-8">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Category</h2>
          <div className="flex flex-wrap gap-2">
            {['AI','Blog','Booking','Building blocks','Chat','CRM','Dashboard','Directory & listings','Finance','Game','Landing page','Marketplace','Mobile','On-demand services','Online store','Portfolio'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-white border border-blue-200 rounded-full text-blue-900 text-sm font-medium cursor-default hover:bg-blue-100">{cat}</span>
            ))}
          </div>
        </aside>
        <div className="flex-1">
          {/* Filtres */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex gap-3">
              <select className="px-4 py-2 rounded border border-blue-200 bg-white text-blue-900 cursor-default" disabled>
                <option>Free and paid</option>
              </select>
              <select className="px-4 py-2 rounded border border-blue-200 bg-white text-blue-900 cursor-default" disabled>
                <option>All experience levels</option>
              </select>
            </div>
            <div className="md:ml-auto">
              <button className="flex items-center gap-2 px-4 py-2 rounded border border-blue-200 bg-white text-blue-900 cursor-default">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                </svg>
                Sort by: Most installed
              </button>
            </div>
          </div>
          {/* Grille de templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Carte de template exemple */}
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-5 flex flex-col gap-4">
                <div className="w-full aspect-video bg-blue-100 rounded-lg flex items-center justify-center">
                  {/* Embbed Youtube (placeholder) */}
                  <iframe
                    className="rounded-lg"
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded w-fit mb-1">BUILDING BLOCKS</span>
                  <h3 className="text-lg font-semibold text-blue-900">Canvas Building Framework</h3>
                  <p className="text-sm text-blue-900/80">Le framework complet pour construire des apps IA rapidement avec Canvas.</p>
                  <div className="flex items-center gap-2 mt-2 justify-between">
                    <div>
                      <span className="text-base font-bold text-blue-900">€49</span>
                      <span className="text-xs text-blue-900/60">•</span>
                      <span className="text-xs text-blue-900/60">71.3K installs</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow hover:bg-blue-700 cursor-default">S'abonner</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer Bannière */}
      <footer className="w-full bg-white text-blue-900 py-4 px-8 flex items-center justify-end text-sm mt-12 border-t border-blue-100 text-right">
        © 2025 iIAhome Tous droits réservés
      </footer>
    </div>
  );
}
