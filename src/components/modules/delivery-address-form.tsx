"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import Input from "@/components/ui/input";
import { User, Phone, MapPin, Building2 } from "lucide-react";
import type { DeliveryAddressRequest } from "@/lib/api/types";

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kenitra", "Tétouan", "Salé", "Nador",
  "Béni Mellal", "Khouribga", "El Jadida", "Safi", "Mohammedia",
];

const schema = z.object({
  firstName: z.string().min(2, "Prénom requis (min. 2 caractères)"),
  lastName:  z.string().min(2, "Nom requis (min. 2 caractères)"),
  phone:     z.string().min(9, "Numéro de téléphone requis"),
  street:    z.string().min(5, "Adresse requise (min. 5 caractères)"),
  city:      z.string().min(1, "Ville requise"),
  zipCode:   z.string().optional(),
});

export type DeliveryAddressFormData = z.infer<typeof schema>;

export interface DeliveryAddressFormRef {
  getValues: () => DeliveryAddressFormData | null;
  validate: () => Promise<boolean>;
}

interface DeliveryAddressFormProps {
  isAr?: boolean;
  defaultValues?: Partial<DeliveryAddressFormData>;
  onChange?: (data: Partial<DeliveryAddressRequest>) => void;
}

export const DeliveryAddressForm = forwardRef<DeliveryAddressFormRef, DeliveryAddressFormProps>(
  function DeliveryAddressForm({ isAr = false, defaultValues, onChange }, ref) {
    const {
      register,
      getValues,
      trigger,
      watch,
      formState: { errors },
    } = useForm<DeliveryAddressFormData>({
      resolver: zodResolver(schema),
      defaultValues: defaultValues ?? {},
    });

    useImperativeHandle(ref, () => ({
      getValues: () => {
        const vals = getValues();
        const valid = schema.safeParse(vals);
        return valid.success ? vals : null;
      },
      validate: () => trigger(),
    }));

    return (
      <div className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={isAr ? "الاسم الأول" : "Prénom"}
            leftIcon={<User size={15} />}
            fullWidth
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label={isAr ? "اسم العائلة" : "Nom"}
            leftIcon={<User size={15} />}
            fullWidth
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        {/* Phone */}
        <Input
          label={isAr ? "الهاتف" : "Téléphone"}
          type="tel"
          placeholder="+212 6XX XXX XXX"
          leftIcon={<Phone size={15} />}
          fullWidth
          error={errors.phone?.message}
          {...register("phone")}
        />

        {/* Street */}
        <Input
          label={isAr ? "العنوان" : "Adresse"}
          placeholder={isAr ? "الشارع، رقم المبنى..." : "Rue, numéro de porte..."}
          leftIcon={<MapPin size={15} />}
          fullWidth
          error={errors.street?.message}
          {...register("street")}
        />

        {/* City + ZIP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isAr ? "المدينة *" : "Ville *"}
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 bg-white"
              {...register("city")}
            >
              <option value="">{isAr ? "اختر مدينة" : "Choisir une ville"}</option>
              {MOROCCAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
            )}
          </div>
          <Input
            label={isAr ? "الرمز البريدي" : "Code postal"}
            placeholder="XXXXX"
            leftIcon={<Building2 size={15} />}
            fullWidth
            {...register("zipCode")}
          />
        </div>
      </div>
    );
  }
);
