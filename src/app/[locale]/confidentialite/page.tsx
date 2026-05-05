import { ShieldCheck } from "lucide-react";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const sections = [
    {
      title: "1. Données collectées",
      titleAr: "١. البيانات المجمَّعة",
      content: "Nous collectons : informations d'identité (nom, prénom), coordonnées (email, téléphone, adresse), données de navigation (cookies, adresse IP), historique de commandes et préférences. Ces données sont indispensables au fonctionnement du service.",
      contentAr: "نجمع: معلومات الهوية (الاسم الأول والأخير)، بيانات الاتصال (البريد الإلكتروني، الهاتف، العنوان)، بيانات التصفح (ملفات الارتباط، عنوان IP)، سجل الطلبات والتفضيلات. هذه البيانات ضرورية لتشغيل الخدمة.",
    },
    {
      title: "2. Utilisation des données",
      titleAr: "٢. استخدام البيانات",
      content: "Vos données sont utilisées pour : traiter vos commandes et paiements, vous informer du suivi de livraison, personnaliser votre expérience, vous envoyer des offres promotionnelles (avec votre consentement), améliorer nos services, et prévenir les fraudes.",
      contentAr: "تُستخدَم بياناتك في: معالجة طلباتك ومدفوعاتك، إبلاغك بمتابعة التوصيل، تخصيص تجربتك، إرسال عروض ترويجية (بموافقتك)، تحسين خدماتنا، ومنع الاحتيال.",
    },
    {
      title: "3. Partage des données",
      titleAr: "٣. مشاركة البيانات",
      content: "Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec : les vendeurs concernés par vos commandes, nos partenaires logistiques pour la livraison, les prestataires de paiement (CMI), et les autorités compétentes sur demande légale.",
      contentAr: "لا تُباع بياناتك أبداً لأطراف ثالثة. يمكن مشاركتها مع: البائعين المعنيين بطلباتك، شركاء اللوجستيات للتوصيل، مزودي الدفع (CMI)، والسلطات المختصة بموجب طلب قانوني.",
    },
    {
      title: "4. Cookies",
      titleAr: "٤. ملفات الارتباط",
      content: "Nous utilisons des cookies essentiels (session, panier), des cookies analytiques (Google Analytics) et des cookies de personnalisation. Vous pouvez configurer vos préférences via notre bandeau cookies ou les paramètres de votre navigateur.",
      contentAr: "نستخدم ملفات ارتباط أساسية (الجلسة، السلة)، ملفات ارتباط تحليلية (Google Analytics)، وملفات ارتباط للتخصيص. يمكنك ضبط تفضيلاتك عبر شريط ملفات الارتباط أو إعدادات متصفحك.",
    },
    {
      title: "5. Vos droits",
      titleAr: "٥. حقوقك",
      content: "Conformément à la loi 09-08 relative à la protection des données personnelles au Maroc, vous disposez des droits d'accès, de rectification, de suppression et d'opposition. Pour exercer ces droits, contactez-nous à privacy@soukdigital.ma.",
      contentAr: "وفقاً للقانون 09-08 المتعلق بحماية البيانات الشخصية في المغرب، تتمتع بحقوق الوصول والتصحيح والحذف والاعتراض. لممارسة هذه الحقوق، تواصل معنا على privacy@soukdigital.ma.",
    },
    {
      title: "6. Sécurité",
      titleAr: "٦. الأمان",
      content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement SSL/TLS, hébergement sécurisé, accès restreint aux données, audits de sécurité réguliers et conformité PCI DSS pour les données de paiement.",
      contentAr: "ننفّذ تدابير تقنية وتنظيمية مناسبة لحماية بياناتك: تشفير SSL/TLS، استضافة آمنة، وصول مقيَّد للبيانات، تدقيقات أمنية دورية، والامتثال لـPCI DSS لبيانات الدفع.",
    },
    {
      title: "7. Conservation des données",
      titleAr: "٧. الاحتفاظ بالبيانات",
      content: "Vos données de compte sont conservées pendant la durée de votre relation avec Souk Digital, puis 5 ans après la clôture du compte pour des raisons légales. Les données de navigation sont conservées 13 mois maximum.",
      contentAr: "تُحفَظ بيانات حسابك طوال مدة علاقتك مع Souk Digital، ثم 5 سنوات بعد إغلاق الحساب لأسباب قانونية. تُحفَظ بيانات التصفح 13 شهراً كحد أقصى.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4">
        <ShieldCheck size={32} className="text-blue-700" />
      </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          {isAr ? "سياسة الخصوصية" : "Politique de confidentialité"}
        </h1>
        <p className="text-gray-400 text-sm">
          {isAr ? "آخر تحديث: 1 يناير 2026" : "Dernière mise à jour : 1er janvier 2026"}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 flex items-start gap-3">
        <ShieldCheck size={18} className="text-blue-700 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 leading-relaxed">
          {isAr
            ? "نأخذ خصوصيتك على محمل الجد. هذه السياسة تشرح بدقة كيف نجمع بياناتك ونستخدمها ونحميها."
            : "Votre vie privée est notre priorité. Cette politique explique avec précision comment nous collectons, utilisons et protégeons vos données."}
        </p>
      </div>

      <div className="space-y-6">
        {sections.map(({ title, titleAr, content, contentAr }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-souk-green-800 mb-3">
              {isAr ? titleAr : title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isAr ? contentAr : content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gray-50 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          {isAr ? "للاستفسار عن خصوصيتك:" : "Pour toute question relative à vos données personnelles :"}
        </p>
        <a href="mailto:privacy@soukdigital.ma" className="font-bold text-souk-green-700 hover:text-souk-green-800 text-sm">
          privacy@soukdigital.ma
        </a>
        <p className="text-xs text-gray-400 mt-2">
          {isAr ? "المسؤول عن البيانات: Souk Digital SARL — الدار البيضاء، المغرب" : "Responsable du traitement : Souk Digital SARL — Casablanca, Maroc"}
        </p>
      </div>
    </div>
  );
}
