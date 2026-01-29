-- Create manual_fund_requests table
CREATE TABLE IF NOT EXISTS public.manual_fund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_fund_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own manual requests" 
    ON public.manual_fund_requests 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own manual requests" 
    ON public.manual_fund_requests 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all manual requests" 
    ON public.manual_fund_requests 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Add to Prisma by modifying backend/prisma/schema.prisma later
