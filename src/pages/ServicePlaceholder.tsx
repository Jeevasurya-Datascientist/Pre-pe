import { HomeHeader } from "@/components/home/HomeHeader";
import { BottomNav } from "@/components/home/BottomNav";
import { useParams } from "react-router-dom";

const ServicePlaceholder = () => {
    const { serviceName } = useParams();
    const title = serviceName ? serviceName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Service';

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative pb-20">
                <div className="bg-green-50/50 pb-4">
                    <HomeHeader />
                </div>
                <div className="p-6 flex flex-col items-center justify-center h-[60vh] text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
                    <p className="text-gray-500">
                        This service is coming soon!
                    </p>
                </div>
                <BottomNav />
            </div>
        </div>
    );
};

export default ServicePlaceholder;
