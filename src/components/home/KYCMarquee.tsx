export const KYCMarquee = () => {
    return (
        <div className="bg-blue-100/50 py-2 overflow-hidden mx-4 rounded-lg border border-blue-200/50 my-3">
            <div className="animate-marquee whitespace-nowrap">
                <span className="text-xs text-blue-700 font-medium px-4">
                    📝 Complete your Video KYC to unlock higher transaction limits! It's quick, easy, and completely online.
                </span>
                <span className="text-xs text-blue-700 font-medium px-4">
                    ⚡ Instant Wallet Top-up available via UPI. Add money now!
                </span>
            </div>
        </div>
    );
};
