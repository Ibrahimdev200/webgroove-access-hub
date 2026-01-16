-- Allow vendors to delete their own products
CREATE POLICY "Vendors can delete their own products"
  ON public.marketplace_products FOR DELETE
  USING (auth.uid() = vendor_id);