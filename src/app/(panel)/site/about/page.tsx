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
import { defaultAboutContent } from "@/lib/site-content/seed";
import type { AboutPageContent } from "@/lib/site-content/types";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function SiteAboutPage() {
  const [content, setContent] = useState<AboutPageContent>(defaultAboutContent);

  function saveUiOnly() {
    toast.message("فعلاً فقط UI است", {
      description: "محتوای درباره ما هنوز به API وصل نشده؛ تغییرات فقط در این جلسه نگه داشته می‌شود.",
    });
  }

  function resetSeed() {
    setContent(defaultAboutContent);
    toast.success("به محتوای پیش‌فرض کمپ برگشت");
  }

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="صفحات سایت"
        title="درباره ما"
        description="محتوای صفحه /about در سایت کلاسور کمپ — فعلاً فقط ویرایش UI بدون ذخیره سرور."
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
          <FormField label="متن مشترک" className="space-y-2 sm:col-span-2">
            <Textarea
              rows={4}
              value={content.hero.sharedText}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, sharedText: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="عنوان سمت راست">
            <Input
              value={content.hero.rightHeading}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, rightHeading: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="متن دکمه راست">
            <Input
              value={content.hero.rightButtonText}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, rightButtonText: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="عنوان سمت چپ">
            <Input
              value={content.hero.leftHeading}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, leftHeading: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="متن دکمه چپ">
            <Input
              value={content.hero.leftButtonText}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, leftButtonText: event.target.value },
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
          <CardTitle>ویژگی‌ها</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setContent((prev) => ({
                ...prev,
                features: [...prev.features, { id: newId("feature"), text: "" }],
              }))
            }
          >
            <Plus className="size-3.5" />
            افزودن
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.features.map((feature, index) => (
            <div key={feature.id} className="flex gap-2">
              <Input
                value={feature.text}
                placeholder="متن ویژگی"
                onChange={(event) =>
                  setContent((prev) => {
                    const features = [...prev.features];
                    features[index] = { ...feature, text: event.target.value };
                    return { ...prev, features };
                  })
                }
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  setContent((prev) => ({
                    ...prev,
                    features: prev.features.filter((item) => item.id !== feature.id),
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
          <CardTitle>خبرنامه</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="عنوان">
            <Input
              value={content.newsletter.title}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, title: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="متن دکمه">
            <Input
              value={content.newsletter.submitLabel}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, submitLabel: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="توضیح" className="space-y-2 sm:col-span-2">
            <Textarea
              rows={3}
              value={content.newsletter.description}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, description: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="placeholder ایمیل" className="space-y-2 sm:col-span-2">
            <Input
              value={content.newsletter.placeholder}
              onChange={(event) =>
                setContent((prev) => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, placeholder: event.target.value },
                }))
              }
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>نظرات دانشجویان</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setContent((prev) => ({
                ...prev,
                testimonials: [
                  ...prev.testimonials,
                  {
                    id: newId("review"),
                    name: "",
                    date: "",
                    avatar: "/home/Avatar.png",
                    quote: "",
                    rating: 5,
                  },
                ],
              }))
            }
          >
            <Plus className="size-3.5" />
            افزودن
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.testimonials.map((item, index) => (
            <div key={item.id} className="space-y-3 rounded-xl border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="نام">
                  <Input
                    value={item.name}
                    onChange={(event) =>
                      setContent((prev) => {
                        const testimonials = [...prev.testimonials];
                        testimonials[index] = { ...item, name: event.target.value };
                        return { ...prev, testimonials };
                      })
                    }
                  />
                </FormField>
                <FormField label="تاریخ">
                  <Input
                    value={item.date}
                    onChange={(event) =>
                      setContent((prev) => {
                        const testimonials = [...prev.testimonials];
                        testimonials[index] = { ...item, date: event.target.value };
                        return { ...prev, testimonials };
                      })
                    }
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <ImageDropField
                    label="آواتار"
                    value={item.avatar || null}
                    onChange={(next) =>
                      setContent((prev) => {
                        const testimonials = [...prev.testimonials];
                        testimonials[index] = { ...item, avatar: next ?? "" };
                        return { ...prev, testimonials };
                      })
                    }
                  />
                </div>
                <FormField label="امتیاز">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={0.5}
                    value={item.rating}
                    onChange={(event) =>
                      setContent((prev) => {
                        const testimonials = [...prev.testimonials];
                        testimonials[index] = {
                          ...item,
                          rating: Number(event.target.value) || 0,
                        };
                        return { ...prev, testimonials };
                      })
                    }
                  />
                </FormField>
              </div>
              <FormField label="نقل‌قول">
                <Textarea
                  rows={3}
                  value={item.quote}
                  onChange={(event) =>
                    setContent((prev) => {
                      const testimonials = [...prev.testimonials];
                      testimonials[index] = { ...item, quote: event.target.value };
                      return { ...prev, testimonials };
                    })
                  }
                />
              </FormField>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  setContent((prev) => ({
                    ...prev,
                    testimonials: prev.testimonials.filter((row) => row.id !== item.id),
                  }))
                }
              >
                <Trash2 className="size-3.5" />
                حذف نظر
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>بلاک تماس در درباره ما</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="عنوان">
              <Input
                value={content.contactBlock.title}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    contactBlock: { ...prev.contactBlock, title: event.target.value },
                  }))
                }
              />
            </FormField>
            <FormField label="توضیح" className="space-y-2 sm:col-span-2">
              <Textarea
                rows={2}
                value={content.contactBlock.description}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    contactBlock: {
                      ...prev.contactBlock,
                      description: event.target.value,
                    },
                  }))
                }
              />
            </FormField>
          </div>
          {content.contactBlock.items.map((item, index) => (
            <div key={item.id} className="grid gap-3 sm:grid-cols-2">
              <FormField label="برچسب">
                <Input
                  value={item.label}
                  onChange={(event) =>
                    setContent((prev) => {
                      const items = [...prev.contactBlock.items];
                      items[index] = { ...item, label: event.target.value };
                      return {
                        ...prev,
                        contactBlock: { ...prev.contactBlock, items },
                      };
                    })
                  }
                />
              </FormField>
              <FormField label="مقدار">
                <Input
                  dir="ltr"
                  value={item.value}
                  onChange={(event) =>
                    setContent((prev) => {
                      const items = [...prev.contactBlock.items];
                      items[index] = { ...item, value: event.target.value };
                      return {
                        ...prev,
                        contactBlock: { ...prev.contactBlock, items },
                      };
                    })
                  }
                />
              </FormField>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>سوالات متداول</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setContent((prev) => ({
                ...prev,
                faqs: [
                  ...prev.faqs,
                  { id: newId("faq"), question: "", answer: "" },
                ],
              }))
            }
          >
            <Plus className="size-3.5" />
            افزودن
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.faqs.map((faq, index) => (
            <div key={faq.id} className="space-y-3 rounded-xl border border-border p-4">
              <FormField label="سوال">
                <Input
                  value={faq.question}
                  onChange={(event) =>
                    setContent((prev) => {
                      const faqs = [...prev.faqs];
                      faqs[index] = { ...faq, question: event.target.value };
                      return { ...prev, faqs };
                    })
                  }
                />
              </FormField>
              <FormField label="پاسخ">
                <Textarea
                  rows={3}
                  value={faq.answer}
                  onChange={(event) =>
                    setContent((prev) => {
                      const faqs = [...prev.faqs];
                      faqs[index] = { ...faq, answer: event.target.value };
                      return { ...prev, faqs };
                    })
                  }
                />
              </FormField>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  setContent((prev) => ({
                    ...prev,
                    faqs: prev.faqs.filter((row) => row.id !== faq.id),
                  }))
                }
              >
                <Trash2 className="size-3.5" />
                حذف FAQ
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
