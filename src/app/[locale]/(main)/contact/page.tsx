"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, CheckCircle, MailOpen } from "lucide-react";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  { value: "order",    labelFr: "Ma commande",          labelAr: "طلبي" },
  { value: "return",   labelFr: "Retour / Remboursement", labelAr: "إرجاع / استرداد" },
  { value: "vendor",   labelFr: "Devenir vendeur",      labelAr: "الانضمام كبائع" },
  { value: "payment",  labelFr: "Problème de paiement", labelAr: "مشكلة في الدفع" },
  { value: "account",  labelFr: "Mon compte",           labelAr: "حسابي" },
  { value: "other",    labelFr: "Autre",                labelAr: "أخرى" },
];

export default function ContactPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          {isAr ? "تم الإرسال بنجاح!" : "Message envoyé !"}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {isAr
            ? "سنرد عليك خلال 24 ساعة على أقصى تقدير."
            : "Notre équipe vous répondra dans les 24h. Merci de votre patience."}
        </p>
        <Button onClick={() => setSent(false)}>
          {isAr ? "إرسال رسالة أخرى" : "Envoyer un autre message"}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-souk-green-100 mb-4">
        <MailOpen size={32} className="text-souk-green-700" />
      </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          {isAr ? "تواصل معنا" : "Contactez-nous"}
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          {isAr
            ? "فريقنا متاح لمساعدتك طوال أيام الأسبوع"
            : "Notre équipe est à votre disposition 7j/7 pour vous aider"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info cards */}
        <div className="space-y-4">
          {[
            {
              icon: Phone,
              title: isAr ? "هاتف" : "Téléphone",
              lines: ["+212 5XX-XXXXXX", isAr ? "الإثنين - السبت، 9ص - 7م" : "Lun–Sam, 9h–19h"],
              color: "text-souk-green-700 bg-souk-green-50",
              action: { label: isAr ? "اتصل بنا" : "Appeler", href: "tel:+212522000000" },
            },
            {
              icon: Mail,
              title: isAr ? "البريد الإلكتروني" : "Email",
              lines: ["support@soukdigital.ma", isAr ? "رد خلال 24 ساعة" : "Réponse sous 24h"],
              color: "text-blue-700 bg-blue-50",
              action: { label: isAr ? "أرسل بريداً" : "Écrire", href: "mailto:support@soukdigital.ma" },
            },
            {
              icon: MessageCircle,
              title: "WhatsApp",
              lines: ["+212 6XX-XXXXXX", isAr ? "رسائل فورية" : "Réponse instantanée"],
              color: "text-green-700 bg-green-50",
              action: { label: "WhatsApp", href: "https://wa.me/212600000000" },
            },
            {
              icon: MapPin,
              title: isAr ? "العنوان" : "Adresse",
              lines: ["123 Bd Anfa, Maarif", "Casablanca 20100, Maroc"],
              color: "text-souk-terracotta-700 bg-souk-terracotta-50",
              action: null,
            },
          ].map(({ icon: Icon, title, lines, color, action }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{title}</p>
                  {lines.map((line, i) => (
                    <p key={i} className={cn("text-sm mt-0.5", i === 0 ? "text-gray-700" : "text-gray-400 text-xs")}>{line}</p>
                  ))}
                  {action && (
                    <a href={action.href} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs font-semibold text-souk-green-700 hover:text-souk-green-800 underline underline-offset-2">
                      {action.label} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Hours */}
          <div className="bg-souk-green-50 rounded-2xl border border-souk-green-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-souk-green-700" />
              <p className="font-bold text-souk-green-900 text-sm">{isAr ? "ساعات العمل" : "Horaires"}</p>
            </div>
            {[
              { day: isAr ? "الإثنين - الجمعة" : "Lun – Ven", hours: "9h00 – 19h00" },
              { day: isAr ? "السبت" : "Samedi", hours: "9h00 – 17h00" },
              { day: isAr ? "الأحد" : "Dimanche", hours: isAr ? "مغلق" : "Fermé" },
            ].map(({ day, hours }) => (
              <div key={day} className="flex justify-between text-xs py-1.5 border-b border-souk-green-100 last:border-0">
                <span className="text-souk-green-800">{day}</span>
                <span className={cn("font-semibold", hours === "Fermé" || hours === "مغلق" ? "text-red-500" : "text-souk-green-700")}>{hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-black text-gray-900 mb-6">
              {isAr ? "أرسل رسالتك" : "Envoyez-nous un message"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    {isAr ? "الاسم الكامل" : "Nom complet"} <span className="text-red-400">*</span>
                  </label>
                  <input
                    required value={form.name} onChange={update("name")}
                    placeholder={isAr ? "Mohammed Alami" : "Mohammed Alami"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    {isAr ? "البريد الإلكتروني" : "Email"} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email" required value={form.email} onChange={update("email")}
                    placeholder="email@exemple.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {isAr ? "رقم الهاتف" : "Téléphone"}
                </label>
                <input
                  type="tel" value={form.phone} onChange={update("phone")}
                  placeholder="06XXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {isAr ? "الموضوع" : "Sujet"} <span className="text-red-400">*</span>
                </label>
                <select
                  required value={form.subject} onChange={update("subject")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-souk-green-500"
                >
                  <option value="">{isAr ? "اختر موضوعاً..." : "Choisissez un sujet..."}</option>
                  {SUBJECTS.map(({ value, labelFr, labelAr }) => (
                    <option key={value} value={value}>{isAr ? labelAr : labelFr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {isAr ? "الرسالة" : "Message"} <span className="text-red-400">*</span>
                </label>
                <textarea
                  required value={form.message} onChange={update("message")}
                  rows={6}
                  placeholder={isAr ? "اكتب رسالتك هنا..." : "Décrivez votre problème ou question en détail..."}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 resize-none"
                />
              </div>

              <Button type="submit" loading={loading} leftIcon={<Send size={16} />} className="w-full sm:w-auto">
                {isAr ? "إرسال الرسالة" : "Envoyer le message"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mt-10 rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-64 bg-souk-sand relative">
        <div className="absolute inset-0 flex items-center justify-center bg-souk-green-50">
          <div className="text-center">
            <MapPin size={40} className="text-souk-green-700 mx-auto mb-2" />
            <p className="font-bold text-souk-green-900">Souk Digital — Casablanca</p>
            <p className="text-sm text-souk-green-600">123 Boulevard Anfa, Maarif, Casablanca 20100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
