import Image from "next/image";
import { Mail } from "lucide-react";
import Button from "@/components/Button";

interface AccountBannerProps {
    username: string;
    email: string;
    avatarUrl: string;
    onEditProfile: () => void;
}

export function AccountBanner({ username, email, avatarUrl, onEditProfile }: AccountBannerProps) {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-orange to-orange-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-white p-1">
                        <Image src={avatarUrl} alt="User Avatar" fill className="rounded-full object-cover" />
                    </div>
                </div>
            </div>
            <div className="text-center sm:text-left flex-grow">
                <p className="text-sm text-gray-500 font-medium">Welcome back,</p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{username}</h1>
                <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <Mail className="w-4 h-4" />
                    {email}
                </p>
            </div>
            <div className="flex-shrink-0">
                <Button
                    className="bg-brand-orange text-white hover:bg-brand-orange/90 text-sm !py-3 !px-6 cursor-pointer rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-200"
                    onClickFunction={onEditProfile}
                >
                    Edit Profile
                </Button>
            </div>
        </div>
    );
}
