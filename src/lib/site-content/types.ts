/** Editable site pages (camp /about + /contact). UI-only until panel APIs exist. */

export type SiteLabelValue = {
  id: string;
  label: string;
  value: string;
};

export type SiteSocialLink = {
  id: string;
  label: string;
  href: string;
};

export type SiteFeature = {
  id: string;
  text: string;
};

export type SiteTestimonial = {
  id: string;
  name: string;
  date: string;
  avatar: string;
  quote: string;
  rating: number;
};

export type SiteFaq = {
  id: string;
  question: string;
  answer: string;
};

export type AboutPageContent = {
  hero: {
    sharedText: string;
    rightHeading: string;
    rightButtonText: string;
    leftHeading: string;
    leftButtonText: string;
    image: string;
    imageAlt: string;
  };
  features: SiteFeature[];
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    submitLabel: string;
  };
  testimonials: SiteTestimonial[];
  contactBlock: {
    title: string;
    description: string;
    items: SiteLabelValue[];
  };
  faqs: SiteFaq[];
};

export type ContactPageContent = {
  hero: {
    eyebrow: string;
    heading: string;
    description: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    image: string;
    imageAlt: string;
  };
  info: {
    title: string;
    description: string;
    items: SiteLabelValue[];
    socialTitle: string;
    socialLinks: SiteSocialLink[];
  };
  map: {
    title: string;
    description: string;
    address: string;
    embedUrl: string;
  };
  form: {
    title: string;
    subtitle: string;
    footerNote: string;
    submitLabel: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  };
};
