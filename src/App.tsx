import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";

import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import ServicePlaceholder from "./pages/ServicePlaceholder";
import MobileRecharge from "./pages/MobileRecharge";
import Postpaid from "./pages/Postpaid";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import { SelectProviderPage } from "./pages/SelectProviderPage";
import { RedeemCodePage } from "./pages/RedeemCodePage";
import { DTHSelectProvider } from "./pages/dth/DTHSelectProvider";
import { DTHEnterDetails } from "./pages/dth/DTHEnterDetails";

import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CommissionManager from "./pages/admin/CommissionManager";
import TransactionsAdmin from "./pages/admin/TransactionsAdmin";
import TopUpPage from "./pages/TopUpPage";
import DTHRechargePage from "./pages/DTHRecharge";

import TransactionDetailsPage from "./pages/TransactionDetailsPage";
import LedgerPage from "./pages/LedgerPage";
import HistoryPage from "./pages/reports/HistoryPage";
import ProfileSettings from "./pages/settings/ProfileSettings";
import ThemeSettings from "./pages/settings/ThemeSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import KYCUpgrade from "./pages/settings/KYCUpgrade";
import KYCPage from "./pages/KYCPage";
import ReferEarn from "./pages/settings/ReferEarn";
import CashbackOffers from "./pages/settings/CashbackOffers";
import LegalPage from "./pages/settings/LegalPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />


          {/* Settings Sub-routes - Verified for Navigation */}
          <Route path="/profile/edit" element={<ProfileSettings />} />
          <Route path="/profile/theme" element={<ThemeSettings />} />
          <Route path="/profile/security" element={<SecuritySettings />} />
          <Route path="/profile/kyc" element={<KYCUpgrade />} />
          <Route path="/kyc" element={<KYCPage />} />
          <Route path="/profile/refer" element={<ReferEarn />} />
          <Route path="/profile/offers" element={<CashbackOffers />} />
          <Route path="/legal/terms" element={<LegalPage title="Terms & Conditions" type="terms" />} />
          <Route path="/legal/privacy" element={<LegalPage title="Privacy Policy" type="privacy" />} />
          <Route path="/legal/refund" element={<LegalPage title="Refund Policy" type="refund" />} />

          <Route path="/mobile-recharge" element={<MobileRecharge />} />
          <Route path="/offers" element={<CashbackOffers />} />

          {/* Provider Selection Routes */}
          <Route path="/dth-recharge" element={<DTHSelectProvider />} />
          <Route path="/dth-recharge/enter-details" element={<DTHEnterDetails />} />
          <Route path="/services/electricity" element={<SelectProviderPage type="electricity" title="Select Provider" />} />
          <Route path="/services/broadband" element={<SelectProviderPage type="broadband" title="Select Broadband" />} />
          <Route path="/services/redeem-code" element={<RedeemCodePage />} />

          <Route path="/services/:serviceName" element={<ServicePlaceholder />} />

          <Route path="/postpaid" element={<Postpaid />} />
          {/* Other routes... */}

          <Route path="/wallet" element={<Wallet />} />
          <Route path="/wallet/topup" element={<TopUpPage />} />
          <Route path="/wallet/ledger" element={<LedgerPage />} />
          <Route path="/reports/history" element={<HistoryPage />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transaction/:id" element={<TransactionDetailsPage />} />


          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="transactions" element={<TransactionsAdmin />} />
            <Route path="commissions" element={<CommissionManager />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
