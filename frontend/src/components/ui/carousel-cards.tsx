import React from "react";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Next.js compatibility fallbacks for Vite/React environment
const Image = ({ src, alt, fill, className, ...props }: any) => (
  <img
    src={src}
    alt={alt || ""}
    className={className}
    style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : undefined}
    {...props}
  />
);

const Link = ({ href, children, className, ...props }: any) => (
  <a href={href || "#"} className={className} {...props}>
    {children}
  </a>
);

export interface ExperienceItem {
  id: string;
  title: string;
  image: string;
  location: string;
  price: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  date?: string;
}

export interface ExperienceGridProps {
  title: string;
  items: ExperienceItem[];
  viewAllHref?: string;
}

export const sampleExperiences: ExperienceItem[] = [
  {
    id: "1",
    title: "Become an Otaku Hottie with Megan Thee Stallion",
    image: "https://cdn.21st.dev/assets/mirror/e6/e637dac088a6725c7c3b446aa4e9a885eeb1a349a0640a936bc269460b97dceb.jpg",
    location: "Los Angeles, United States",
    price: 120,
    currency: "€",
    rating: 4.97,
    reviewCount: 128,
    badge: "Original",
    date: "Closes May 21",
  },
  {
    id: "2",
    title: "Spend a Sunday Funday with Patrick Mahomes",
    image: "https://cdn.21st.dev/assets/mirror/8e/8ea802c3a2f07ebf0086632796e36be685b7f8cc7fb89463fe39f2b36dd1f35b.jpg",
    location: "Kansas City, United States",
    price: 150,
    currency: "€",
    rating: 4.92,
    reviewCount: 86,
    badge: "Original",
    date: "Closes Today",
  },
  {
    id: "3",
    title: "Celebrate with SEVENTEEN on their 10th anniversary",
    image: "https://cdn.21st.dev/assets/mirror/50/501af93e434ec2dfced6a410ab261860549b8bf6889541e4cd0e699e40d087d1.jpg",
    location: "Seoul, South Korea",
    price: 200,
    currency: "€",
    rating: 4.98,
    reviewCount: 254,
    badge: "Original",
    date: "Closed May 17",
  },
  {
    id: "4",
    title: "Learn the secrets of French pastry with nonnas",
    image: "https://cdn.21st.dev/assets/mirror/7c/7c61521a6e198201ee227146ae2738168bfb64fa09e446a0887c94073eb13bde.jpg",
    location: "Paris, France",
    price: 70,
    currency: "€",
    rating: 4.97,
    reviewCount: 112,
    badge: "Original",
  },
];

export const popularExperiences: ExperienceItem[] = [
  {
    id: "p1",
    title: "Learn to bake the French Croissant",
    image: "https://cdn.21st.dev/assets/mirror/b5/b59d189f652821aee1bfa1332a520972ce8502c843da8c6d73f1eba27965e396.jpg",
    location: "Paris, France",
    price: 95,
    currency: "€",
    rating: 4.95,
    reviewCount: 218,
    badge: "Popular",
  },
  {
    id: "p2",
    title: "Seek out hidden speakeasy bars in the city",
    image: "https://cdn.21st.dev/assets/mirror/5b/5b615acd8874bd3b23ee445afd073e417639d55d77360510fed04b75fadd34f1.jpg",
    location: "Paris, France",
    price: 74,
    currency: "€",
    rating: 4.9,
    reviewCount: 165,
    badge: "Popular",
  },
];

const ExperienceCard = ({ experience }: { experience: ExperienceItem }) => (
  <Card className="group relative flex h-[320px] w-full flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
      <Image
        alt={experience.title}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        fill
        src={experience.image}
      />
      <Button
        className="absolute top-2 right-2 z-10 rounded-full bg-white/80 text-neutral-700 backdrop-blur-sm hover:bg-white/90 hover:text-black cursor-pointer"
        size="icon"
        variant="ghost"
      >
        <Heart className="h-4 w-4 stroke-[2px]" />
        <span className="sr-only">Add to favorites</span>
      </Button>
      {experience.badge && (
        <Badge className="absolute top-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 font-medium text-black text-xs">
          {experience.badge}
        </Badge>
      )}
    </div>

    <div className="flex flex-1 flex-col justify-between">
      <CardContent className="p-2 pt-3 pb-0">
        <h3 className="font-medium text-sm tracking-tight text-slate-900 dark:text-slate-100">
          {experience.title}
        </h3>
        <p className="text-muted-foreground text-xs tracking-tight text-slate-500">
          {experience.location}
        </p>
        {experience.date && (
          <p className="text-muted-foreground text-xs tracking-tight text-slate-500">
            {experience.date}
          </p>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center gap-0.5 p-2 pt-0 text-xs">
        {experience.rating && (
          <span className="flex items-center gap-0.5 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            {experience.rating}
          </span>
        )}
        {experience.reviewCount && (
          <span className="text-muted-foreground text-xs tracking-tight text-slate-500">
            {experience.rating && "·"}
            {experience.reviewCount > 0 ? ` (${experience.reviewCount})` : ""}
          </span>
        )}
        <span className="ml-auto text-xs tracking-tight font-mono text-slate-900 dark:text-slate-100">
          {experience.currency || "€"} {experience.price} / guest
        </span>
      </CardFooter>
    </div>
  </Card>
);

export const ExperienceSection = ({
  title,
  items,
  viewAllHref = "#",
}: ExperienceGridProps) => {
  const scrollContainer = React.useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: -320,
        behavior: "smooth",
      });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full py-4">
      <div className="mx-auto max-w-[1760px] px-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium text-lg tracking-tight md:text-xl text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              className="h-7 w-7 rounded-full border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900 cursor-pointer"
              onClick={handleScrollLeft}
              size="icon"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Scroll left</span>
            </Button>
            <Button
              className="h-7 w-7 rounded-full border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900 cursor-pointer"
              onClick={handleScrollRight}
              size="icon"
              variant="outline"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Scroll right</span>
            </Button>
            <Link
              className="ml-1 hidden font-medium text-xs hover:underline md:block text-slate-400"
              href={viewAllHref}
            >
              Show all
            </Link>
          </div>
        </div>

        <div
          className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
          ref={scrollContainer}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {items.map((item) => (
            <div
              className="w-[240px] flex-none snap-start md:w-[260px]"
              key={item.id}
            >
              <Link
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                href="#"
              >
                <ExperienceCard experience={item} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function CarouselCards() {
  return (
    <div className="mt-4 w-full space-y-4">
      <ExperienceSection
        items={sampleExperiences}
        title="Airbnb Originals ›"
        viewAllHref="#"
      />
      <ExperienceSection
        items={popularExperiences}
        title="Popular experiences in Paris"
        viewAllHref="#"
      />
    </div>
  );
}
