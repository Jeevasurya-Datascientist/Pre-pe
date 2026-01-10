import { HomeHeader } from "@/components/home/HomeHeader";
import { BottomNav } from "@/components/home/BottomNav";

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative pb-20">
                <div className="bg-green-50/50 pb-4">
                    <HomeHeader />
                </div>
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-green-700 mb-4">Contact Support</h1>
                    <p className="text-gray-600 mb-4">
                        Need help? Reach out to our support team.
                    </p>
                    {/* Add contact form or details here later */}
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="font-medium">Customer Care</p>
                        <p className="text-sm text-gray-500">connect.prepe@gmail.com</p>
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
};

export default ContactPage;
