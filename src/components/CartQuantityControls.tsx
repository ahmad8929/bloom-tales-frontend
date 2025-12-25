'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { cartApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RootState } from '@/store';
import { updateCartItemLocal } from '@/store/slices/cartSlice';

interface CartQuantityControlsProps {
  productId: string;
  initialQuantity: number;
  cartItemId?: string;
  className?: string;
  onQuantityChange?: (quantity: number) => void;
}

export function CartQuantityControls({
  productId,
  initialQuantity,
  cartItemId,
  className,
  onQuantityChange,
}: CartQuantityControlsProps) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: reduxCartItems } = useSelector((state: RootState) => state.cart);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return;

    setIsUpdating(true);
    try {
      if (isAuthenticated) {
        // For authenticated users, use API
        if (cartItemId) {
          const response = await cartApi.updateCartItem(cartItemId, newQuantity);
          
          if (response.error) {
            throw new Error(response.error);
          }

          setQuantity(newQuantity);
          onQuantityChange?.(newQuantity);

          // Trigger cart refresh event
          window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { action: 'update', productId, quantity: newQuantity }
          }));
        } else {
          // If no cartItemId, we need to fetch cart to find the item
          const cartResponse = await cartApi.getCart();
          if (cartResponse.data?.data?.cart?.items) {
            const cartItem = cartResponse.data.data.cart.items.find(
              (item: any) => item.productId === productId || item.product._id === productId
            );
            
            if (cartItem) {
              const response = await cartApi.updateCartItem(cartItem._id, newQuantity);
              if (response.error) {
                throw new Error(response.error);
              }
              setQuantity(newQuantity);
              onQuantityChange?.(newQuantity);
              
              window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { action: 'update', productId, quantity: newQuantity }
              }));
            }
          }
        }
      } else {
        // For guest users, update Redux state
        dispatch(updateCartItemLocal({ productId, quantity: newQuantity }));
        setQuantity(newQuantity);
        onQuantityChange?.(newQuantity);
        
        // Trigger cart refresh event
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: { action: 'update', productId, quantity: newQuantity }
        }));
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    updateQuantity(quantity + 1);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDecrease();
        }}
        disabled={isUpdating || quantity <= 1}
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Minus className="h-3 w-3" />
        )}
      </Button>
      <span className="min-w-[2rem] text-center font-medium text-sm">
        {quantity}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleIncrease();
        }}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Plus className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}

