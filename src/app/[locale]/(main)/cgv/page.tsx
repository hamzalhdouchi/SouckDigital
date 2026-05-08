import { FileText } from "lucide-react";

export default async function CGVPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const sections = [
    {
      title: "1. Objet",
      titleAr: "١. الموضوع",
      content: "Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Souk Digital SARL (ci-après « la Plateforme »), société marocaine immatriculée sous le numéro RC 123456 à Casablanca, et tout utilisateur souhaitant effectuer un achat sur le site soukdigital.ma.",
      contentAr: "تحكم هذه الشروط العامة للبيع العلاقات التعاقدية بين Souk Digital SARL (المنصة)، الشركة المغربية المسجلة برقم RC 123456 في الدار البيضاء، وأي مستخدم يرغب في إجراء عملية شراء على الموقع soukdigital.ma.",
    },
    {
      title: "2. Prix",
      titleAr: "٢. الأسعار",
      content: "Tous les prix affichés sont en Dirhams marocains (DH) et incluent la TVA applicable. Les frais de livraison sont indiqués séparément lors du passage de commande. La Plateforme se réserve le droit de modifier ses prix à tout moment, sans préavis, les prix applicables étant ceux en vigueur au moment de la commande.",
      contentAr: "جميع الأسعار المعروضة بالدرهم المغربي (DH) وتشمل ضريبة القيمة المضافة المعمول بها. تُحدَّد رسوم التوصيل بشكل منفصل عند تقديم الطلب. تحتفظ المنصة بحق تعديل أسعارها في أي وقت دون إشعار مسبق، والأسعار المطبَّقة هي تلك السارية وقت تقديم الطلب.",
    },
    {
      title: "3. Commandes",
      titleAr: "٣. الطلبات",
      content: "Toute commande passée sur la Plateforme vaut acceptation des présentes CGV. La commande est confirmée par email après validation du paiement ou confirmation du paiement à la livraison. Souk Digital se réserve le droit d'annuler toute commande suspecte ou frauduleuse.",
      contentAr: "يُعدّ أي طلب مُقدَّم على المنصة قبولاً لهذه الشروط العامة للبيع. يُؤكَّد الطلب عبر البريد الإلكتروني بعد التحقق من الدفع أو تأكيد الدفع عند التسليم. تحتفظ Souk Digital بحق إلغاء أي طلب مشبوه أو احتيالي.",
    },
    {
      title: "4. Livraison",
      titleAr: "٤. التوصيل",
      content: "La livraison est effectuée partout au Maroc. Les délais indicatifs sont de 24 à 72h dans les grandes villes et de 3 à 5 jours ouvrables pour les autres régions. Ces délais courent à partir de la confirmation de commande. En cas de retard significatif, le client sera informé par SMS ou email.",
      contentAr: "يُنفَّذ التوصيل في جميع أنحاء المغرب. مدد التوصيل المرجعية هي 24 إلى 72 ساعة في المدن الكبرى، و3 إلى 5 أيام عمل في المناطق الأخرى. تسري هذه المدد من تأكيد الطلب. في حالة التأخير الكبير، يُعلَم العميل عبر SMS أو البريد الإلكتروني.",
    },
    {
      title: "5. Droit de rétractation",
      titleAr: "٥. حق الإرجاع",
      content: "Conformément à la loi marocaine sur la protection du consommateur, l'acheteur dispose d'un délai de 30 jours à compter de la réception pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités. Ce droit ne s'applique pas aux produits personnalisés, périssables ou téléchargés.",
      contentAr: "وفقاً لقانون حماية المستهلك المغربي، يحق للمشتري الإرجاع خلال 30 يوماً من الاستلام دون الحاجة إلى تبرير الأسباب أو دفع غرامات. لا ينطبق هذا الحق على المنتجات المخصصة أو القابلة للتلف أو المحمَّلة رقمياً.",
    },
    {
      title: "6. Garanties",
      titleAr: "٦. الضمانات",
      content: "Tous les produits vendus sur la Plateforme bénéficient de la garantie légale de conformité. En cas de défaut constaté dans les 30 jours suivant la livraison, Souk Digital prend en charge le retour et le remplacement ou remboursement du produit.",
      contentAr: "تستفيد جميع المنتجات المُباعة على المنصة من ضمان قانوني للمطابقة. في حالة اكتشاف عيب خلال 30 يوماً من التسليم، تتكفل Souk Digital بتغطية الإرجاع واستبدال المنتج أو استرداد المبلغ.",
    },
    {
      title: "7. Responsabilités",
      titleAr: "٧. المسؤوليات",
      content: "Souk Digital est une marketplace mettant en relation des vendeurs indépendants et des acheteurs. La Plateforme n'est pas fabricant des produits vendus et sa responsabilité est limitée au bon fonctionnement de la plateforme technique. Les vendeurs sont seuls responsables de la conformité et qualité de leurs produits.",
      contentAr: "Souk Digital منصة تجمع البائعين المستقلين والمشترين. المنصة ليست مصنِّعة للمنتجات المُباعة ومسؤوليتها محدودة بحسن تشغيل المنصة التقنية. البائعون وحدهم مسؤولون عن مطابقة وجودة منتجاتهم.",
    },
    {
      title: "8. Loi applicable",
      titleAr: "٨. القانون المطبَّق",
      content: "Les présentes CGV sont soumises au droit marocain. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, le différend sera soumis aux tribunaux compétents de Casablanca.",
      contentAr: "تخضع هذه الشروط العامة للبيع للقانون المغربي. في حالة نزاع، تسعى الأطراف إلى إيجاد حل ودي. في حالة الفشل، يُحال الخلاف إلى المحاكم المختصة في الدار البيضاء.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          {isAr ? "الشروط العامة للبيع" : "Conditions Générales de Vente"}
        </h1>
        <p className="text-gray-400 text-sm">
          {isAr ? "آخر تحديث: 1 يناير 2026" : "Dernière mise à jour : 1er janvier 2026"}
        </p>
      </div>

      <div className="bg-souk-green-50 border border-souk-green-200 rounded-2xl p-5 mb-8 flex items-start gap-3">
        <FileText size={18} className="text-souk-green-700 shrink-0 mt-0.5" />
        <p className="text-sm text-souk-green-800 leading-relaxed">
          {isAr
            ? "الرجاء قراءة هذه الشروط بعناية قبل إجراء أي عملية شراء على منصتنا. باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط."
            : "Veuillez lire attentivement ces conditions avant tout achat sur notre plateforme. En utilisant la plateforme, vous acceptez d'être lié par ces conditions."}
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

      <div className="mt-10 text-center text-xs text-gray-400">
        <p>{isAr ? "للاستفسارات القانونية:" : "Pour toute question légale :"}</p>
        <p className="mt-1 font-medium text-gray-600">legal@soukdigital.ma</p>
      </div>
    </div>
  );
}
