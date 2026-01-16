import { useState, useEffect } from "react";
import { Loader2, Package, DollarSign, Coins, Image, List, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCategories, useUpdateProduct, VendorProduct } from "@/hooks/useVendorProducts";

interface EditProductModalProps {
  product: VendorProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProductModal = ({ product, open, onOpenChange }: EditProductModalProps) => {
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    features: "",
    image_url: "",
    tau_price: "",
    cash_price: "",
    category_id: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        features: product.features?.join("\n") || "",
        image_url: product.image_url || "",
        tau_price: product.tau_price.toString(),
        cash_price: product.cash_price?.toString() || "",
        category_id: product.category_id,
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Please select a category";
    }

    const tauPrice = parseFloat(formData.tau_price);
    if (!formData.tau_price || isNaN(tauPrice)) {
      newErrors.tau_price = "TAU price is required";
    } else if (tauPrice < 1) {
      newErrors.tau_price = "TAU price must be at least 1";
    } else if (tauPrice > 100000) {
      newErrors.tau_price = "TAU price must be less than 100,000";
    }

    if (formData.cash_price) {
      const cashPrice = parseFloat(formData.cash_price);
      if (isNaN(cashPrice) || cashPrice < 0) {
        newErrors.cash_price = "Invalid cash price";
      } else if (cashPrice > 1000000) {
        newErrors.cash_price = "Cash price must be less than $1,000,000";
      }
    }

    if (formData.image_url) {
      try {
        new URL(formData.image_url);
      } catch {
        newErrors.image_url = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const tauPrice = parseFloat(formData.tau_price);
      const cashPrice = formData.cash_price ? parseFloat(formData.cash_price) : undefined;
      
      // Parse features (split by newlines)
      const features = formData.features
        .split("\n")
        .map(f => f.trim())
        .filter(f => f.length > 0);

      await updateProduct.mutateAsync({
        id: product.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        features,
        image_url: formData.image_url.trim() || undefined,
        tau_price: tauPrice,
        base_price_usd: cashPrice || tauPrice,
        cash_price: cashPrice,
        category_id: formData.category_id,
      });

      toast({
        title: "Product updated!",
        description: "Your changes have been saved successfully.",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update product",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-tau" />
            Edit Product
          </DialogTitle>
          <DialogDescription>
            Update your product details. Changes to active products may require re-review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Product Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Advanced React Course"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger className={errors.category_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description *
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Describe your product, what it includes, and its benefits..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/1000 characters
            </p>
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="edit-features" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Features (one per line)
            </Label>
            <Textarea
              id="edit-features"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              value={formData.features}
              onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="edit-image_url" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image URL (optional)
            </Label>
            <Input
              id="edit-image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              className={errors.image_url ? "border-destructive" : ""}
            />
            {errors.image_url && <p className="text-xs text-destructive">{errors.image_url}</p>}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tau_price" className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-tau" />
                TAU Price *
              </Label>
              <Input
                id="edit-tau_price"
                type="number"
                min="1"
                step="0.01"
                placeholder="100"
                value={formData.tau_price}
                onChange={(e) => setFormData(prev => ({ ...prev, tau_price: e.target.value }))}
                className={errors.tau_price ? "border-destructive" : ""}
              />
              {errors.tau_price && <p className="text-xs text-destructive">{errors.tau_price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cash_price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cash Price (optional)
              </Label>
              <Input
                id="edit-cash_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="49.99"
                value={formData.cash_price}
                onChange={(e) => setFormData(prev => ({ ...prev, cash_price: e.target.value }))}
                className={errors.cash_price ? "border-destructive" : ""}
              />
              {errors.cash_price && <p className="text-xs text-destructive">{errors.cash_price}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="tau" 
              className="flex-1"
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};