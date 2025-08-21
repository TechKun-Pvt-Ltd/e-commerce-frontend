import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TestimonialCardProps {
  testimonial: string;
  clientName: string;
  clientImage: string;
}

export const TestimonialCard = ({ testimonial, clientName, clientImage }: TestimonialCardProps) => {
  return (
    <div className="p-8 border ">
      <div className="space-y-6">
        {/* <Quote className="w-8 h-8  opacity-70" /> */}
        <img  src="/quote.png" alt="" className="w-12 h-12" />
        <p className="text-foreground h-36 text-lg leading-relaxed">
          {testimonial}
        </p>
        <div className="flex items-center gap-4">
          <img
            src={clientImage}
            alt={`${clientName} profile`}
            className="w-12 h-12 rounded-full object-cover border-2 border-border"
          />
          <span className="text-muted-foreground font-medium">{clientName}</span>
        </div>
      </div>
    </div>
  );
};