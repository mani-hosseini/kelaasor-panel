"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/site/FormField";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageDropField } from "@/components/ui/ImageDropField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultContactContent } from "@/lib/site-content/seed";
import type { ContactPageContent } from "@/lib/site-content/types";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function SiteContactPage() {
  const [content, setContent] = useState<ContactPageContent>(defaultContactContent);

  function saveUiOnly() {
    toast.message("فعلاً فقط UI است", {
      description: "محتوای تماس با ما هنوز به API وصل نشده؛ تغییرات فقط در این جلسه نگه داشته می‌شود.",
    });
  }

  function resetSeed() {
    setContent(defaultContactContent);
    toast.success("به محتوای پیش‌فرض کمپ برگشت");
  }

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="صفحات سایت"
        title="تماس با ما"
        description="محتوای صفحه /contact در سایت کلاسور کمپ — فعلاً فقط ویرایش UI بدون ذخیره سرور."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">بدون API</Badge>
            <Button type="button" variant="outline" onClick={resetSeed}>
              بازگردانی seed
            </Button>
            <Button type="button" onClick={saveUiOnly}>
              ذخیره (UI)
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>هیرو</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="eyebrow">
            <Input
              value={content.hero.eyebrow}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, eyebrow: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="عنوان">
            <Input
              value={content.hero.heading}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, heading: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="توضیح" className="space-y-2 sm:col-span-2">
            <Textarea
              rows={4}
              value={content.hero.description}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, description: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="متن CTA اصلی">
            <Input
              value={content.hero.primaryCtaText}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, primaryCtaText: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="متن CTA ثانویه">
            <Input
              value={content.hero.secondaryCtaText}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, secondaryCtaText: event.target.value },
                }))
              }
            />
          </FormField>
          <div className="sm:col-span-2">
            <ImageDropField
              label="تصویر هیرو"
              value={content.hero.image || null}
              onChange={(next) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, image: next ?? "" },
                }))
              }
            />
          </div>
          <FormField label="alt تصویر">
            <Input
              value={content.hero.imageAlt}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, imageAlt: event.target.value },
                }))
              }
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>اطلاعات تماس</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setContent((prev) => ({
                ...prev,
                info: {
                  ...prev.info,
                  items: [
                    ...prev.info.items,
                    { id: newId("info"), label: "", value: "" },
                  ],
                },
              }))
            }
          >
            <Plus className="size-3.5" />
            افزودن آیتم
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="عنوان بخش">
              <Input
                value={content.info.title}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    info: { ...prev.info, title: event.target.value },
                  }))
                }
              />
            </FormField>
            <FormField label="عنوان شبکه‌های اجتماعی">
              <Input
                value={content.info.socialTitle}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    info: { ...prev.info, socialTitle: event.target.value },
                  }))
                }
              />
            </FormField>
            <FormField label="توضیح" className="space-y-2 sm:col-span-2">
              <Textarea
                rows={2}
                value={content.info.description}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    info: { ...prev.info, description: event.target.value },
                  }))
                }
              />
            </FormField>
          </div>

          {content.info.items.map((item, index) => (
            <div key={item.id} className="flex flex-col gap-3 sm:flex-row">
              <FormField label="برچسب" className="w-full space-y-2">
                <Input
                  value={item.label}
                  onChange={(event) =>
                    setContent((prev) => {
                      const items = [...prev.info.items];
                      items[index] = { ...item, label: event.target.value };
                      return { ...prev, info: { ...prev.info, items } };
                    })
                  }
                />
              </FormField>
              <FormField label="مقدار" className="w-full space-y-2">
                <Input
                  dir="ltr"
                  value={item.value}
                  onChange={(event) =>
                    setContent((prev) => {
                      const items = [...prev.info.items];
                      items[index] = { ...item, value: event.target.value };
                      return { ...prev, info: { ...prev.info, items } };
                    })
                  }
                />
              </FormField>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="mt-7 shrink-0 text-destructive"
                onClick={() =>
                  setContent((prev) => ({
                    ...prev,
                    info: {
                      ...prev.info,
                      items: prev.info.items.filter((row) => row.id !== item.id),
                    },
                  }))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>شبکه‌های اجتماعی</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setContent((prev) => ({
                ...prev,
                info: {
                  ...prev.info,
                  socialLinks: [
                    ...prev.info.socialLinks,
                    { id: newId("social"), label: "", href: "https://" },
                  ],
                },
              }))
            }
          >
            <Plus className="size-3.5" />
            افزودن لینک
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.info.socialLinks.map((link, index) => (
            <div key={link.id} className="flex flex-col gap-3 sm:flex-row">
              <FormField label="نام" className="w-full space-y-2 sm:max-w-[10rem]">
                <Input
                  value={link.label}
                  onChange={(event) =>
                    setContent((prev) => {
                      const socialLinks = [...prev.info.socialLinks];
                      socialLinks[index] = { ...link, label: event.target.value };
                      return { ...prev, info: { ...prev.info, socialLinks } };
                    })
                  }
                />
              </FormField>
              <FormField label="آدرس" className="w-full space-y-2">
                <Input
                  dir="ltr"
                  value={link.href}
                  onChange={(event) =>
                    setContent((prev) => {
                      const socialLinks = [...prev.info.socialLinks];
                      socialLinks[index] = { ...link, href: event.target.value };
                      return { ...prev, info: { ...prev.info, socialLinks } };
                    })
                  }
                />
              </FormField>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="mt-7 shrink-0 text-destructive"
                onClick={() =>
                  setContent((prev) => ({
                    ...prev,
                    info: {
                      ...prev.info,
                      socialLinks: prev.info.socialLinks.filter(
                        (row) => row.id !== link.id,
                      ),
                    },
                  }))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نقشه و نشانی</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="عنوان">
            <Input
              value={content.map.title}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  map: { ...prev.map, title: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="توضیح" className="space-y-2 sm:col-span-2">
            <Textarea
              rows={2}
              value={content.map.description}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  map: { ...prev.map, description: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="آدرس متنی" className="space-y-2 sm:col-span-2">
            <Textarea
              rows={2}
              value={content.map.address}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  map: { ...prev.map, address: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="embed URL نقشه" className="space-y-2 sm:col-span-2">
            <Input
              dir="ltr"
              value={content.map.embedUrl}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  map: { ...prev.map, embedUrl: event.target.value },
                }))
              }
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>برچسب‌های فرم پیام</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="عنوان فرم">
            <Input
              value={content.form.title}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  form: { ...prev.form, title: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="زیرعنوان">
            <Input
              value={content.form.subtitle}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  form: { ...prev.form, subtitle: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="متن دکمه ارسال">
            <Input
              value={content.form.submitLabel}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  form: { ...prev.form, submitLabel: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="یادداشت پایین فرم">
            <Input
              value={content.form.footerNote}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  form: { ...prev.form, footerNote: event.target.value },
                }))
              }
            />
          </FormField>
          {(
            [
              ["firstName", "برچسب نام"],
              ["lastName", "برچسب نام خانوادگی"],
              ["email", "برچسب ایمیل"],
              ["phone", "برچسب تلفن"],
              ["subject", "برچسب موضوع"],
              ["message", "برچسب پیام"],
            ] as const
          ).map(([key, label]) => (
            <FormField key={key} label={label}>
              <Input
                value={content.form[key]}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    form: { ...prev.form, [key]: event.target.value },
                  }))
                }
              />
            </FormField>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
