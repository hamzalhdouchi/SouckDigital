"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, Search, MessageCircle, Phone, HelpCircle, Truck, CreditCard, RotateCcw, ShieldCheck, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Livraison": Truck,
  "Paiement": CreditCard,
  "Retours & Remboursements": RotateCcw,
  "Compte & Sécurité": ShieldCheck,
  "Devenir Vendeur": Store,
};

const FAQ_DATA = [
  {
    category: "Livraison",
    categoryAr: "التوصيل",
    questions: [
      {
        q: "Quels sont les délais de livraison ?",
        qAr: "ما هي مدة التوصيل؟",
        a: "La livraison standard prend 24 à 72h dans les grandes villes (Casablanca, Rabat, Marrakech, Fès, Agadir). Pour les zones rurales et éloignées, comptez 3 à 5 jours ouvrables. Une livraison express en 24h est disponible dans les principales villes.",
        aAr: "يستغرق التوصيل العادي من 24 إلى 72 ساعة في المدن الكبرى (الدار البيضاء، الرباط، مراكش، فاس، أكادير). للمناطق النائية، يستغرق من 3 إلى 5 أيام عمل. التوصيل السريع خلال 24 ساعة متاح في المدن الرئيسية.",
      },
      {
        q: "La livraison est-elle gratuite ?",
        qAr: "هل التوصيل مجاني؟",
        a: "La livraison est gratuite pour toute commande supérieure à 300 DH. En dessous de ce seuil, des frais de livraison s'appliquent selon votre région (20 à 50 DH). Certains vendeurs offrent la livraison gratuite sur tous leurs produits.",
        aAr: "التوصيل مجاني لأي طلب يتجاوز 300 درهم. دون هذا المبلغ، تُطبَّق رسوم توصيل تتراوح بين 20 و50 درهماً حسب منطقتك. بعض البائعين يقدمون التوصيل المجاني على جميع منتجاتهم.",
      },
      {
        q: "Puis-je suivre ma commande en temps réel ?",
        qAr: "هل يمكنني تتبع طلبي في الوقت الفعلي؟",
        a: "Oui ! Dès l'expédition, vous recevrez un SMS et un email avec un lien de suivi. Vous pouvez aussi suivre votre commande depuis votre espace client, rubrique 'Mes commandes'.",
        aAr: "نعم! فور شحن طلبك، ستتلقى رسالة SMS وبريداً إلكترونياً مع رابط التتبع. يمكنك أيضاً متابعة طلبك من حسابك في قسم 'طلباتي'.",
      },
    ],
  },
  {
    category: "Paiement",
    categoryAr: "الدفع",
    questions: [
      {
        q: "Quels modes de paiement acceptez-vous ?",
        qAr: "ما هي طرق الدفع المقبولة؟",
        a: "Nous acceptons : le paiement à la livraison (espèces), les cartes bancaires Visa/Mastercard via CMI, Mobile Money (Inwi Money, Orange Money, M-Wallet), les virements bancaires, et CashPlus/Wafacash. Le paiement à la livraison représente la méthode la plus utilisée au Maroc.",
        aAr: "نقبل: الدفع عند التسليم (نقداً)، البطاقات البنكية Visa/Mastercard عبر CMI، Mobile Money (Inwi Money, Orange Money, M-Wallet)، التحويلات البنكية، وCashPlus/Wafacash. الدفع عند التسليم هو الأكثر استخداماً في المغرب.",
      },
      {
        q: "Le paiement en ligne est-il sécurisé ?",
        qAr: "هل الدفع الإلكتروني آمن؟",
        a: "Absolument. Nos paiements en ligne sont traités par CMI (Centre Monétique Interbancaire), certifié PCI DSS niveau 1. Toutes les données de carte sont chiffrées et jamais stockées sur nos serveurs.",
        aAr: "بالتأكيد. تتم معالجة مدفوعاتنا الإلكترونية عبر CMI (المركز النقدي البنكي المشترك)، المعتمد بمستوى PCI DSS 1. جميع بيانات البطاقة مشفرة ولا تُخزَّن على خوادمنا أبداً.",
      },
      {
        q: "Puis-je obtenir une facture pour ma commande ?",
        qAr: "هل يمكنني الحصول على فاتورة لطلبي؟",
        a: "Oui, une facture est automatiquement générée pour chaque commande. Vous pouvez la télécharger depuis votre espace client. Pour une facture professionnelle (avec ICE), contactez notre support.",
        aAr: "نعم، تُولَّد فاتورة تلقائياً لكل طلب. يمكنك تنزيلها من حسابك. للحصول على فاتورة مهنية (مع ICE)، تواصل مع دعمنا.",
      },
    ],
  },
  {
    category: "Retours & Remboursements",
    categoryAr: "الإرجاع والاسترداد",
    questions: [
      {
        q: "Quelle est votre politique de retour ?",
        qAr: "ما هي سياسة الإرجاع لديكم؟",
        a: "Vous disposez de 30 jours après réception pour retourner un article. Le produit doit être dans son état d'origine, non utilisé et dans son emballage d'origine. Les articles personnalisés ou alimentaires ne peuvent pas être retournés.",
        aAr: "لديك 30 يوماً من استلام الطلب لإرجاع المنتج. يجب أن يكون المنتج في حالته الأصلية، غير مستخدم وفي عبوته الأصلية. لا يمكن إرجاع المنتجات المخصصة أو الغذائية.",
      },
      {
        q: "Comment initier un retour ?",
        qAr: "كيف أبدأ إجراء الإرجاع؟",
        a: "Connectez-vous à votre compte, rendez-vous dans 'Mes commandes', sélectionnez la commande et cliquez sur 'Demander un retour'. Un bon de retour vous sera envoyé par email. Vous pouvez aussi contacter notre service client.",
        aAr: "سجّل الدخول إلى حسابك، انتقل إلى 'طلباتي'، اختر الطلب وانقر على 'طلب الإرجاع'. سيُرسَل إليك تصريح إرجاع عبر البريد الإلكتروني. يمكنك أيضاً التواصل مع خدمة العملاء.",
      },
      {
        q: "Dans quel délai suis-je remboursé ?",
        qAr: "متى يتم استرداد المبلغ؟",
        a: "Le remboursement est effectué dans les 5 à 10 jours ouvrables après réception du retour par le vendeur. Pour les paiements par carte, le délai peut varier selon votre banque. Les remboursements en espèces se font via CashPlus ou virement.",
        aAr: "يتم الاسترداد خلال 5 إلى 10 أيام عمل بعد استلام البائع للمنتج المُرجَع. لمدفوعات البطاقة، قد يتفاوت التوقيت حسب بنكك. المبالغ النقدية تُسترد عبر CashPlus أو تحويل بنكي.",
      },
    ],
  },
  {
    category: "Compte & Sécurité",
    categoryAr: "الحساب والأمان",
    questions: [
      {
        q: "Comment créer un compte ?",
        qAr: "كيف أنشئ حساباً؟",
        a: "Cliquez sur 'S'inscrire' en haut de la page. Renseignez votre prénom, nom, email ou numéro de téléphone marocain, et un mot de passe. Un code OTP par SMS vous sera envoyé pour vérifier votre numéro.",
        aAr: "انقر على 'إنشاء حساب' في أعلى الصفحة. أدخل اسمك الأول والأخير، بريدك الإلكتروني أو رقم هاتفك المغربي، وكلمة مرور. سيُرسَل إليك رمز OTP عبر SMS للتحقق من رقمك.",
      },
      {
        q: "J'ai oublié mon mot de passe, que faire ?",
        qAr: "نسيت كلمة المرور، ماذا أفعل؟",
        a: "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre email ou numéro de téléphone. Vous recevrez un lien de réinitialisation par email ou un code OTP par SMS.",
        aAr: "في صفحة تسجيل الدخول، انقر على 'نسيت كلمة المرور'. أدخل بريدك الإلكتروني أو رقم هاتفك. ستتلقى رابط إعادة تعيين عبر البريد الإلكتروني أو رمز OTP عبر SMS.",
      },
    ],
  },
  {
    category: "Devenir Vendeur",
    categoryAr: "الانضمام كبائع",
    questions: [
      {
        q: "Comment vendre sur Souk Digital ?",
        qAr: "كيف أبيع على Souk Digital؟",
        a: "Inscrivez-vous en tant que vendeur depuis le menu 'Devenir vendeur'. Fournissez vos documents (patente ou CIN pour artisans), décrivez votre boutique et ajoutez vos produits. Notre équipe vérifie et valide votre compte sous 48h.",
        aAr: "سجّل كبائع من قائمة 'الانضمام كبائع'. قدّم وثائقك (الباتنتة أو بطاقة الهوية للحرفيين)، صف متجرك وأضف منتجاتك. سيتحقق فريقنا ويوافق على حسابك خلال 48 ساعة.",
      },
      {
        q: "Quels sont les frais de commission ?",
        qAr: "ما هي عمولة المنصة؟",
        a: "Souk Digital prélève une commission de 8 à 12% selon la catégorie. L'artisanat bénéficie du taux le plus avantageux (8%). Les 3 premiers mois sont offerts à 0% de commission pour les nouveaux vendeurs.",
        aAr: "تأخذ Souk Digital عمولة من 8 إلى 12% حسب الفئة. تستفيد الصناعة التقليدية من أفضل سعر (8%). الأشهر الثلاثة الأولى بعمولة 0% للبائعين الجدد.",
      },
    ],
  },
];

export default function FAQPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const filteredData = FAQ_DATA.filter((cat) => {
    if (activeCategory && cat.category !== activeCategory) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return cat.questions.some(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-souk-green-100 mb-4">
        <HelpCircle size={32} className="text-souk-green-700" />
      </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          {isAr ? "الأسئلة الشائعة" : "Questions fréquentes"}
        </h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          {isAr
            ? "ابحث في قاعدة معرفتنا أو تصفح حسب الموضوع"
            : "Trouvez rapidement une réponse à vos questions"}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isAr ? "ابحث في الأسئلة..." : "Rechercher une question..."}
          className="w-full ps-11 pe-4 py-3.5 rounded-2xl border border-gray-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-colors",
            !activeCategory ? "bg-souk-green-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {isAr ? "الكل" : "Toutes"}
        </button>
        {FAQ_DATA.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.category];
          return (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5",
                activeCategory === cat.category ? "bg-souk-green-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {Icon && <Icon size={14} />}
              {isAr ? cat.categoryAr : cat.category}
            </button>
          );
        })}
      </div>

      {/* FAQ accordion */}
      <div className="space-y-6">
        {filteredData.map((cat) => (
          <div key={cat.category}>
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
              {CATEGORY_ICONS[cat.category] && (() => { const Icon = CATEGORY_ICONS[cat.category]; return <Icon size={18} className="text-souk-green-700" />; })()}
              {isAr ? cat.categoryAr : cat.category}
            </h2>
            <div className="space-y-2">
              {cat.questions.map((item, i) => {
                const id = `${cat.category}-${i}`;
                const isOpen = openItems.includes(id);
                return (
                  <div key={id} className={cn(
                    "bg-white rounded-xl border transition-colors",
                    isOpen ? "border-souk-green-200 shadow-sm" : "border-gray-100 hover:border-gray-200"
                  )}>
                    <button
                      onClick={() => toggle(id)}
                      className="w-full flex items-start justify-between gap-4 px-5 py-4 text-start"
                    >
                      <span className={cn("text-sm font-semibold leading-snug", isOpen ? "text-souk-green-800" : "text-gray-800")}>
                        {isAr ? item.qAr : item.q}
                      </span>
                      <ChevronDown size={16} className={cn(
                        "shrink-0 mt-0.5 text-gray-400 transition-transform duration-200",
                        isOpen && "rotate-180 text-souk-green-600"
                      )} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                          {isAr ? item.aAr : item.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 bg-souk-green-900 rounded-2xl p-8 text-center text-white">
        <p className="text-xl font-black mb-2">
          {isAr ? "لم تجد إجابتك؟" : "Vous n'avez pas trouvé votre réponse ?"}
        </p>
        <p className="text-souk-green-300 text-sm mb-6">
          {isAr ? "فريقنا متاح 7 أيام في الأسبوع" : "Notre équipe est disponible 7j/7"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/${locale}/contact`} className="inline-flex items-center justify-center gap-2 bg-souk-gold-500 hover:bg-souk-gold-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            <MessageCircle size={16} strokeWidth={1.75} />
            {isAr ? "تواصل معنا" : "Nous contacter"}
          </Link>
          <a href="tel:+212522000000" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            <Phone size={16} />
            +212 5XX-XXXXXX
          </a>
        </div>
      </div>
    </div>
  );
}
