package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Supplier;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.api.UserResponse;
import com.CNTTK18.restaurant_service.dto.review.request.ReviewRequest;
import com.CNTTK18.restaurant_service.dto.review.response.ReviewListResponse;
import com.CNTTK18.restaurant_service.dto.review.response.ReviewResponse;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.exception.InvalidRequestException;
import com.CNTTK18.restaurant_service.mapper.ReviewMapper;
import com.CNTTK18.restaurant_service.model.Products;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.model.Reviews;
import com.CNTTK18.restaurant_service.model.data.ReviewType;
import com.CNTTK18.restaurant_service.repository.ProductRepository;
import com.CNTTK18.restaurant_service.repository.ResRepository;
import com.CNTTK18.restaurant_service.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepo;
    private final WebClient.Builder webClientBuilder;
    private final ProductRepository productRepository;
    private final ResRepository resRepository;
    private final ReviewMapper reviewMapper;

    public List<ReviewResponse> getAllReviews(UUID resId, UUID productId) {
        if (resId != null) {
            return reviewRepo.findByReviewId(resId).stream()
                    .map(reviewMapper::toReviewResponse)
                    .toList();
        }
        if (productId != null) {
            return reviewRepo.findByReviewId(productId).stream()
                    .map(reviewMapper::toReviewResponse)
                    .toList();
        }
        return reviewRepo.findAll().stream().map(reviewMapper::toReviewResponse).toList();
    }

    public ReviewResponse getReviewById(UUID id) {
        return reviewRepo
                .findById(id)
                .map(reviewMapper::toReviewResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }

    @Transactional
    public ReviewResponse createReview(ReviewRequest reviewRequest) {
        UserResponse user = webClientBuilder
                .build()
                .get()
                .uri("lb://user-service/api/users/admin/{id}", reviewRequest.getUserId())
                .retrieve()
                .bodyToMono(UserResponse.class)
                .block();

        if (user == null) throw new ResourceNotFoundException("Không tồn tại user");

        calculateWhenCreate(reviewRequest, reviewRequest.getReviewType(), reviewRequest.getReviewId());

        Reviews rv = Reviews.builder()
                .userId(reviewRequest.getUserId())
                .reviewId(reviewRequest.getReviewId())
                .reviewType(reviewRequest.getReviewType())
                .title(reviewRequest.getTitle())
                .content(reviewRequest.getContent())
                .rating(reviewRequest.getRating())
                .build();

        return reviewMapper.toReviewResponse(reviewRepo.save(rv));
    }

    @Transactional
    public void deleteReview(UUID id, UserRole authUser) {
        Reviews rv = reviewRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        checkAuthority(rv.getUserId(), authUser);
        calculateWhenDelete(rv, rv.getReviewType());
        reviewRepo.delete(rv);
    }

    private void calculateWhenCreate(ReviewRequest reviewRequest, ReviewType rvType, UUID rvId) {
        if (ReviewType.PRODUCT.equals(rvType)) {
            Products product = productRepository
                    .findProductById(rvId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            product.setRating(calculateNewRatingOnCreate(
                    product.getTotalReview(), product.getRating(), reviewRequest.getRating()));
            product.setTotalReview(product.getTotalReview() + 1);
            productRepository.save(product);

        } else if (ReviewType.RESTAURANT.equals(rvType)) {
            Restaurants res = resRepository
                    .findRestaurantById(rvId)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
            res.setRating(calculateNewRatingOnCreate(res.getTotalReview(), res.getRating(), reviewRequest.getRating()));
            res.setTotalReview(res.getTotalReview() + 1);
            resRepository.save(res);

        } else {
            throw new InvalidRequestException("Review Type phải là PRODUCT hoặc RESTAURANT");
        }
    }

    private void calculateWhenDelete(Reviews rv, ReviewType rvType) {
        if (ReviewType.PRODUCT.equals(rvType)) {
            Products product = productRepository
                    .findProductById(rv.getReviewId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            updateRatingOnDelete(
                    product::getTotalReview,
                    product::getRating,
                    product::setTotalReview,
                    product::setRating,
                    rv.getRating());
            productRepository.save(product);

        } else if (ReviewType.RESTAURANT.equals(rvType)) {
            Restaurants res = resRepository
                    .findRestaurantById(rv.getReviewId())
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
            updateRatingOnDelete(
                    res::getTotalReview, res::getRating, res::setTotalReview, res::setRating, rv.getRating());
            resRepository.save(res);
        }
    }

    private float calculateNewRatingOnCreate(int totalReview, float currentRating, float newRating) {
        return (totalReview * currentRating + newRating) / (totalReview + 1);
    }

    private void updateRatingOnDelete(
            Supplier<Integer> getTotal,
            Supplier<Float> getRating,
            Consumer<Integer> setTotal,
            Consumer<Float> setRating,
            float deletedRating) {
        int total = getTotal.get();
        if (total <= 1) {
            setTotal.accept(0);
            setRating.accept(0f);
        } else {
            setRating.accept((total * getRating.get() - deletedRating) / (total - 1));
            setTotal.accept(total - 1);
        }
    }

    private void checkAuthority(UUID id, UserRole authUser) {
        if (authUser != null && !authUser.getId().equals(id) && !"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }

    public ReviewListResponse getProductReviewsById(UUID id) {
        List<Reviews> productReviews = reviewRepo.findByReviewIdAndReviewType(id, ReviewType.PRODUCT);
        return new ReviewListResponse(
                productReviews.stream().map(r -> r.getContent()).toList());
    }

    public ReviewListResponse getRestaurantReviewsById(UUID id) {
        List<Reviews> productReviews = reviewRepo.findByReviewIdAndReviewType(id, ReviewType.RESTAURANT);
        return new ReviewListResponse(
                productReviews.stream().map(r -> r.getContent()).toList());
    }
}
