package com.CNTTK18.order_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import com.CNTTK18.order_service.dto.cart.response.CartItemResponse;
import com.CNTTK18.order_service.dto.cart.response.CartResponse;
import com.CNTTK18.order_service.dto.cart.response.CartRestaurantGroupResponse;
import com.CNTTK18.order_service.model.Cart;
import com.CNTTK18.order_service.model.CartItem;
import com.CNTTK18.order_service.model.CartRestaurantGroup;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CartMapper {
    CartResponse toResponse(Cart cart);

    CartRestaurantGroupResponse toGroupResponse(CartRestaurantGroup group);

    CartItemResponse toItemResponse(CartItem item);
}
