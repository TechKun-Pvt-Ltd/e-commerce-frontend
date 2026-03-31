/* eslint-disable @next/next/no-img-element */
interface CategoryCardProps {
  image: string;
  title: string;
  onClick?: () => void;
}

export const CategoryCard = ({ image, title, onClick }: CategoryCardProps) => {
  return (
    <div 
      className="flex flex-col items-center gap-3 cursor-pointer group transition-all duration-300 hover:scale-105"
      onClick={onClick}
    >
      <div className="w-20 h-20 rounded-full overflow-hidden bg-muted/50 shadow-sm group-hover:shadow-md transition-all duration-300">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
        {title}
      </span>
    </div>
  );
};