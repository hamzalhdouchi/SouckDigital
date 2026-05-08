import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Users, Package, Star, MapPin, ArrowRight, Handshake, Scale, Globe, Gem } from "lucide-react";

// Server component — no "use client" needed
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const stats = [
    { value: "50 000+", labelFr: "Clients actifs", labelAr: "عميل نشط", icon: Users },
    { value: "1 200+", labelFr: "Vendeurs vérifiés", labelAr: "بائع موثّق", icon: CheckCircle },
    { value: "15 000+", labelFr: "Produits disponibles", labelAr: "منتج متاح", icon: Package },
    { value: "4.8/5", labelFr: "Note moyenne", labelAr: "التقييم المتوسط", icon: Star },
  ];

  const values = [
    {
      icon: Gem,
      color: "text-souk-gold-700", bg: "bg-souk-gold-100",
      titleFr: "Artisanat Authentique",
      titleAr: "الصناعة التقليدية الأصيلة",
      descFr: "Nous travaillons directement avec les artisans marocains pour garantir l'authenticité et la qualité de chaque produit.",
      descAr: "نعمل مباشرة مع الحرفيين المغاربة لضمان أصالة وجودة كل منتج.",
    },
    {
      icon: Handshake,
      color: "text-emerald-700", bg: "bg-emerald-100",
      titleFr: "Commerce Équitable",
      titleAr: "التجارة العادلة",
      descFr: "Nos vendeurs conservent 88 à 92% du prix de vente. Nous croyons en une rémunération juste pour les producteurs locaux.",
      descAr: "يحتفظ بائعونا بـ 88 إلى 92% من سعر البيع. نؤمن بالأجر العادل للمنتجين المحليين.",
    },
    {
      icon: Scale,
      color: "text-blue-700", bg: "bg-blue-100",
      titleFr: "Sécurité & Confiance",
      titleAr: "الأمان والثقة",
      descFr: "Paiements sécurisés CMI/PCI DSS, protection acheteurs, et service de médiation en cas de litige.",
      descAr: "مدفوعات آمنة CMI/PCI DSS، حماية المشترين، وخدمة وساطة في حالات النزاع.",
    },
    {
      icon: Globe,
      color: "text-souk-green-700", bg: "bg-souk-green-100",
      titleFr: "Made in Morocco",
      titleAr: "صُنع في المغرب",
      descFr: "Chaque dirham dépensé sur Souk Digital reste dans l'économie marocaine et soutient nos entrepreneurs locaux.",
      descAr: "كل درهم يُنفَق على Souk Digital يبقى في الاقتصاد المغربي ويدعم رواد الأعمال المحليين.",
    },
  ];

  const team = [
    { name: "Youssef El Amrani", role: isAr ? "المدير التنفيذي والمؤسس" : "CEO & Co-fondateur", city: "Casablanca", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
    { name: "Fatima Zahra Benali", role: isAr ? "مديرة العمليات" : "Directrice des opérations", city: "Rabat", img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=80" },
    { name: "Karim Tahiri", role: isAr ? "مدير التقنية" : "CTO", city: "Marrakech", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80" },
    { name: "Amina Oujda", role: isAr ? "مديرة تجربة البائعين" : "Head of Vendor Success", city: "Fès", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="bg-gradient-to-br from-souk-green-900 via-souk-green-800 to-souk-green-900 text-white py-24 px-4 relative">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute w-10 h-10 border border-souk-gold-500 rounded rotate-45"
              style={{ left: `${(i % 6) * 18}%`, top: `${Math.floor(i / 6) * 25}%` }} />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <p className="text-souk-gold-400 font-semibold text-sm mb-4 tracking-widest uppercase">
            {isAr ? "قصتنا" : "Notre histoire"}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
            {isAr
              ? "سوق ديجيتال — أول سوق رقمي مغربي 100٪"
              : "La première marketplace\n100% marocaine"}
          </h1>
          <p className="text-souk-green-200 text-lg max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "أُسِّست عام 2024 بهدف ربط الحرفيين والبائعين المغاربة بملايين المستهلكين، مع الحفاظ على الهوية الثقافية والجودة الأصيلة."
              : "Fondée en 2024 avec une mission claire : connecter les artisans et vendeurs marocains à des millions de consommateurs, tout en préservant l'identité culturelle et l'authenticité du savoir-faire local."}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ value, labelFr, labelAr, icon: Icon }) => (
            <div key={value} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 text-center">
              <Icon size={24} className="text-souk-green-700 mx-auto mb-2" />
              <p className="text-3xl font-black text-souk-green-800">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{isAr ? labelAr : labelFr}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-5">
              {isAr ? "لماذا Souk Digital؟" : "Pourquoi Souk Digital ?"}
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                {isAr
                  ? "في المغرب، يمتلك آلاف الحرفيين والبائعين الموهوبين منتجات استثنائية — لكنهم يفتقرون إلى منصة رقمية تُبرز مهاراتهم وتصلهم بزبائن من كل المغرب."
                  : "Au Maroc, des milliers d'artisans et de vendeurs talentueux fabriquent des produits exceptionnels — mais manquent d'une vitrine numérique pour les mettre en valeur et toucher des clients à travers tout le pays."}
              </p>
              <p>
                {isAr
                  ? "في نفس الوقت، يبحث المستهلكون المغاربة عن منتجات محلية أصيلة، لكنهم يجدون أنفسهم مضطرين للجوء إلى منصات أجنبية لا تراعي خصوصياتهم."
                  : "En parallèle, les consommateurs marocains cherchent des produits locaux authentiques, mais se retrouvent souvent à utiliser des plateformes étrangères qui ne tiennent pas compte de leurs spécificités."}
              </p>
              <p>
                {isAr
                  ? "Souk Digital جاء لسد هذه الفجوة: سوق رقمي مغربي بالكامل، يدعم الدرهم المغربي، يقبل الدفع عند التسليم، ويعزز الصناعة التقليدية."
                  : "Souk Digital est né pour combler ce fossé : une marketplace 100% marocaine, en dirhams, avec paiement à la livraison, qui valorise l'artisanat et soutient l'économie locale."}
              </p>
            </div>
          </div>
          <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1548516173-3cabfa4607e9?w=800&q=80"
              alt="Artisanat marocain"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-souk-green-900/60 to-transparent" />
            <div className="absolute bottom-5 start-5 text-white">
              <p className="font-black text-lg">Artisanat de Safi</p>
              <p className="text-sm text-white/70 flex items-center gap-1"><MapPin size={12} />Safi, Maroc</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-souk-sand py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              {isAr ? "قيمنا" : "Nos valeurs"}
            </h2>
            <p className="text-gray-500 text-sm">
              {isAr ? "المبادئ التي تُوجِّه كل قرار نتخذه" : "Les principes qui guident chacune de nos décisions"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, color, bg, titleFr, titleAr, descFr, descAr }) => (
              <div key={titleFr} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
                  <Icon size={24} className={color} strokeWidth={1.75} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{isAr ? titleAr : titleFr}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{isAr ? descAr : descFr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            {isAr ? "مسيرتنا" : "Notre parcours"}
          </h2>
        </div>
        <div className="relative">
          <div className="absolute start-6 top-0 bottom-0 w-0.5 bg-souk-green-100" />
          <div className="space-y-8">
            {[
              { year: "2024", labelFr: "Fondation de Souk Digital à Casablanca", labelAr: "تأسيس Souk Digital في الدار البيضاء" },
              { year: "2024", labelFr: "Lancement bêta avec 50 vendeurs artisans", labelAr: "إطلاق النسخة التجريبية مع 50 بائعاً حرفياً" },
              { year: "2025", labelFr: "10 000 clients actifs, 500 vendeurs vérifiés", labelAr: "10,000 عميل نشط، 500 بائع موثّق" },
              { year: "2025", labelFr: "Partenariat avec le Ministère de l'Artisanat", labelAr: "شراكة مع وزارة الصناعة التقليدية" },
              { year: "2026", labelFr: "50 000+ clients, 1 200+ vendeurs, couverture nationale", labelAr: "أكثر من 50,000 عميل، 1,200+ بائع، تغطية وطنية" },
            ].map(({ year, labelFr, labelAr }, i) => (
              <div key={i} className="flex items-start gap-6 relative">
                <div className="w-12 h-12 rounded-full bg-souk-green-800 flex items-center justify-center text-white font-black text-xs shrink-0 z-10">
                  {year}
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-1">
                  <p className="text-sm text-gray-700 font-medium">{isAr ? labelAr : labelFr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-souk-green-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">
              {isAr ? "فريقنا" : "Notre équipe"}
            </h2>
            <p className="text-souk-green-300 text-sm">
              {isAr ? "الأشخاص الذين يبنون Souk Digital" : "Les personnes qui construisent Souk Digital"}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role, city, img }) => (
              <div key={name} className="text-center">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden mx-auto mb-3 border-2 border-souk-gold-500/30">
                  <Image src={img} alt={name} fill className="object-cover" />
                </div>
                <p className="font-bold text-white text-sm">{name}</p>
                <p className="text-souk-green-300 text-xs mt-0.5">{role}</p>
                <p className="text-souk-green-400 text-xs flex items-center justify-center gap-1 mt-1">
                  <MapPin size={10} />{city}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            {isAr ? "انضم إلى مجتمع Souk Digital" : "Rejoignez la communauté Souk Digital"}
          </h2>
          <p className="text-gray-500 mb-8">
            {isAr
              ? "سواء كنت مشترياً أو بائعاً أو حرفياً، Souk Digital هو مكانك."
              : "Que vous soyez acheteur, vendeur ou artisan, Souk Digital est fait pour vous."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/register`}
              className="inline-flex items-center justify-center gap-2 bg-souk-green-800 hover:bg-souk-green-900 text-white font-bold px-8 py-3.5 rounded-xl transition-colors">
              {isAr ? "إنشاء حساب مجاني" : "Créer un compte gratuit"}
              <ArrowRight size={18} />
            </Link>
            <Link href={`/${locale}/contact`}
              className="inline-flex items-center justify-center gap-2 bg-souk-sand hover:bg-souk-gold-100 text-souk-green-800 font-bold px-8 py-3.5 rounded-xl transition-colors border border-souk-gold-300">
              {isAr ? "تواصل مع الفريق" : "Contacter l'équipe"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
