import { Button } from "@/components/ui/button";

export const ActionButtons = () => {
    return (
        <div className="flex gap-4 px-4 py-2">
            <Button variant="outline" className="flex-1 bg-green-50 text-green-900 border-none shadow-none hover:bg-green-100 h-12 rounded-xl text-sm font-medium">
                Refer & Earn
            </Button>
            <Button variant="outline" className="flex-1 bg-green-50 text-green-900 border-none shadow-none hover:bg-green-100 h-12 rounded-xl text-sm font-medium">
                Balance & History
            </Button>
        </div>
    );
};
