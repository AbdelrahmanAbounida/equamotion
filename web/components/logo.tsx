import { cn } from "@/lib/utils";
import { Montserrat, Lato, Roboto } from "next/font/google";
import LogoImage from "@/public/logo.png";
import { useRouter } from "next/navigation";

const mont = Montserrat({
  // weight: "600",
  subsets: ["latin"],
});

export const Logo = ({
  className,
  isIcon = false,
  width,
  height,
  clickable = true, // Add this prop
  isLink = true,
}: {
  className?: string;
  isIcon?: boolean;
  width?: number;
  height?: number;
  clickable?: boolean;
  isLink?: boolean;
}) => {
  const router = useRouter();

  const content = (
    <>
      <img
        src={LogoImage?.src}
        // src={"/logos/logo3.png"}
        alt="EquaMotion"
        width={width || 75}
        height={height || 75}
      />
      {!isIcon && (
        <span className="text-[21px] top-2 absolute left-10">EquaMotion</span>
      )}
    </>
  );

  if (!clickable) {
    return (
      <div
        className={cn(
          "flex items-center cursor-pointer justify-start text-start relative w-full text-2xl! font-bold!",
          mont.className,
          className,
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (isLink) {
          router.push("/");
        }
      }}
      className={cn(
        "flex items-center justify-start text-start relative !focus:bg-transparent w-full text-2xl! font-bold!",
        mont.className,
        className,
      )}
    >
      {content}
    </div>
  );
};
