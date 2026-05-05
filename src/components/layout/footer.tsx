import Link from "next/link";
import { useTranslations } from "next-intl";
import { Phone, Mail, MapPin, Truck, Banknote, RotateCcw, ShieldCheck } from "lucide-react";

interface FooterProps { locale: string }

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations("categories");
  const nav = useTranslations("navigation");

  return (
    <footer className="bg-souk-green-900 text-white pb-20 lg:pb-0">
      {/* Trust section */}
      <div className="border-b border-souk-green-800">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck,        color: "text-souk-gold-400", bg: "bg-souk-gold-500/10",       title: "Livraison au Maroc",       sub: "24h–72h dans les grandes villes" },
            { icon: Banknote,     color: "text-emerald-400",   bg: "bg-emerald-500/10",          title: "Paiement à la livraison",  sub: "Disponible partout au Maroc" },
            { icon: RotateCcw,    color: "text-sky-400",       bg: "bg-sky-500/10",              title: "Retours faciles",          sub: "30 jours pour changer d'avis" },
            { icon: ShieldCheck,  color: "text-souk-gold-400", bg: "bg-souk-gold-500/10",        title: "Paiement sécurisé",        sub: "Certifié CMI & PCI DSS" },
          ].map(({ icon: Icon, color, bg, title, sub }) => (
            <div key={title} className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${bg} shrink-0`}>
                <Icon size={20} className={color} strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-souk-green-300 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <p className="text-2xl font-black tracking-tight mb-3">
            سوق<span className="text-souk-gold-500">·</span>Digital
          </p>
          <p className="text-sm text-souk-green-300 leading-relaxed mb-4">
            La première marketplace 100% marocaine. Artisanat authentique, livraison partout au Maroc.
          </p>
          <div className="flex gap-2">
            {[
              { label: "Facebook", href: "#", svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
              { label: "Instagram", href: "#", svg: <><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></> },
              { label: "TikTok", href: "#", svg: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /> },
              { label: "YouTube", href: "#", svg: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></> },
            ].map(({ label, href, svg }) => (
              <a key={label} href={href} aria-label={label}
                className="p-2 rounded-xl bg-souk-green-800 hover:bg-souk-gold-500/20 border border-souk-green-700 hover:border-souk-gold-500/40 transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="text-souk-green-400 group-hover:text-souk-gold-400 transition-colors">
                  {svg}
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold text-sm mb-4 text-souk-gold-400">Catégories</h3>
          <ul className="space-y-2">
            {["artisan", "fashion", "beauty", "home", "food"].map((cat) => (
              <li key={cat}>
                <Link href={`/${locale}/categories/${cat}`} className="text-sm text-souk-green-300 hover:text-white transition-colors">
                  {t(cat as "artisan")}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="font-semibold text-sm mb-4 text-souk-gold-400">Mon compte</h3>
          <ul className="space-y-2 text-sm text-souk-green-300">
            {[
              { label: "S'inscrire", href: "/register" },
              { label: "Se connecter", href: "/login" },
              { label: "Mon profil", href: "/profil" },
              { label: "Devenir vendeur", href: "/vendeur/dashboard" },
              { label: "À propos", href: "/a-propos" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={`/${locale}${item.href}`} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-sm mb-4 text-souk-gold-400">Contact & Aide</h3>
          <ul className="space-y-3 text-sm text-souk-green-300">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-souk-gold-500 shrink-0" />
              <span>+212 5XX-XXXXXX</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-souk-gold-500 shrink-0" />
              <span>support@soukdigital.ma</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="text-souk-gold-500 shrink-0 mt-0.5" />
              <span>Casablanca, Maroc</span>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            <a href="#" className="block">
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-8 opacity-80 hover:opacity-100" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-souk-green-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-souk-green-400">
          <span>© 2026 Souk Digital SARL — Tous droits réservés</span>
          <div className="flex gap-4">
            <Link href={`/${locale}/cgv`} className="hover:text-white">CGV</Link>
            <Link href={`/${locale}/confidentialite`} className="hover:text-white">Confidentialité</Link>
            <Link href={`/${locale}/faq`} className="hover:text-white">FAQ</Link>
            <Link href={`/${locale}/contact`} className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
