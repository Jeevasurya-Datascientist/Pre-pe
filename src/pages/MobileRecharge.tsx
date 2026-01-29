import { Layout } from '@/components/layout/Layout';
import { MobileRechargeForm } from '@/components/recharge/MobileRechargeForm';

const MobileRechargePage = () => {
  return (
    <Layout title="Mobile Recharge" showBack showBottomNav>
      <div className="container px-4 py-6">
        <MobileRechargeForm />
      </div>
    </Layout>
  );
};

export default MobileRechargePage;
