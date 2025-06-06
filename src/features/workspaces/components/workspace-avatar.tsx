import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

type WorkspaceAvatarProps = {
  name: string;
  image?: string;
  className?: string;
};

export function WorkspaceAvatar({
  name,
  image,
  className,
}: WorkspaceAvatarProps) {
  if (image) {
    return (
      <div
        className={cn("relative size-10 rounded-md overflow-hidden", className)}
      >
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <Avatar className={cn("size-10 rounded-md", className)}>
      <AvatarImage src={image} alt={name} />
      <AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
}
