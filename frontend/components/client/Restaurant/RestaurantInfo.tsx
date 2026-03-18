import { Clock, Info, MapPin, Phone } from "lucide-react";

type InfoProps = {
        name: string;
        about: string;
        address: string;
        phone: string;
        openingTime: string;
        closingTime: string;
};

export default function RestaurantInfo({ name, about, address, phone, openingTime, closingTime }: InfoProps) {
        // Generate Google Maps embed URL (free, no API key required)
        const addressToSearch = address || "Ho Chi Minh City, Vietnam";
        const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(addressToSearch)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

        return (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                                <Info className="w-7 h-7 text-brand-orange" />
                                About {name}
                        </h2>
                        <div className="space-y-6">
                                <p className="text-gray-700 leading-relaxed">{about}</p>
                                <div className="border-t pt-6">
                                        <h3 className="text-xl font-bold tracking-tight mb-4 text-gray-900">Location & Hours</h3>
                                        
                                        {/* Google Maps Iframe Embed (Free, no API key) */}
                                        <div className="w-full h-[300px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 mt-4">
                                                <iframe
                                                        width="100%"
                                                        height="100%"
                                                        id="gmap_canvas"
                                                        src={mapUrl}
                                                        frameBorder="0"
                                                        scrolling="no"
                                                        marginHeight={0}
                                                        marginWidth={0}
                                                        loading="lazy"
                                                        allowFullScreen
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        title={`${name} Location Map`}
                                                        className="border-0"
                                                />
                                        </div>

                                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                                        <div className="flex items-center gap-3 text-sm">
                                                                <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                                <p className="text-gray-700">
                                                                        Open: {openingTime} - {closingTime}
                                                                </p>
                                                        </div>
                                                </div>
                                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                                        <div className="flex items-center gap-3 text-sm">
                                                                <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                                <p className="text-gray-700">{phone}</p>
                                                        </div>
                                                </div>
                                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
                                                        <div className="flex items-start gap-3 text-sm">
                                                                <MapPin className="w-5 h-5 mt-0.5 text-gray-500 flex-shrink-0" />
                                                                <p className="text-gray-700">{address}</p>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
