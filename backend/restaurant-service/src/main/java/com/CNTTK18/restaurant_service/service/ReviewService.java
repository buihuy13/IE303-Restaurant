package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.restaurant_service.data.ReviewType;
import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.api.UserResponse;
import com.CNTTK18.restaurant_service.dto.review.request.ReviewRequest;
import com.CNTTK18.restaurant_service.dto.review.response.ReviewResponse;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.exception.InvalidRequestException;
import com.CNTTK18.restaurant_service.mapper.ReviewMapper;
import com.CNTTK18.restaurant_service.model.Products;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.model.Reviews;
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
        List<Reviews> rv = reviewRepo.findAll();
        if (resId != null) {
            rv = rv.stream().filter(r -> r.getReviewId().equals(resId)).toList();
        } else if (productId != null) {
            rv = rv.stream().filter(r -> r.getReviewId().equals(productId)).toList();
        }
        return rv.stream().map(reviewMapper::toReviewResponse).toList();
    }

    public ReviewResponse getReviewById(UUID id) {
        Reviews rv = reviewRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return reviewMapper.toReviewResponse(rv);
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

        if (user == null) {
            throw new ResourceNotFoundException("Không tồn tại user");
        }
        String rvType = reviewRequest.getReviewType();
        UUID rvId = reviewRequest.getReviewId();
        calculateWhenCreate(reviewRequest, rvType, rvId);
        Reviews rv = Reviews.builder()
                .userId(reviewRequest.getUserId())
                .reviewId(rvId)
                .reviewType(rvType)
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
        String rvType = rv.getReviewType();
        calculateWhenDelete(rv, rvType);
        reviewRepo.delete(rv);
    }

    private void calculateWhenCreate(ReviewRequest reviewRequest, String rvType, UUID rvId) {
        if (rvType.equals(ReviewType.PRODUCT.toString())) {
            Products product = productRepository
                    .findProductById(rvId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            float newRating = (product.getTotalReview() * product.getRating() + reviewRequest.getRating())
                    / (product.getTotalReview() + 1);
            product.setTotalReview(product.getTotalReview() + 1);
            product.setRating(newRating);
            productRepository.save(product);
        } else if (rvType.equals(ReviewType.RESTAURANT.toString())) {
            Restaurants res = resRepository
                    .findRestaurantById(rvId)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

            float newRating =
                    (res.getTotalReview() * res.getRating() + reviewRequest.getRating()) / (res.getTotalReview() + 1);
            res.setTotalReview(res.getTotalReview() + 1);
            res.setRating(newRating);
            resRepository.save(res);
        } else {
            throw new InvalidRequestException("Review Type phải là PRODUCT hoặc RESTAURANT");
        }
    }

    private void calculateWhenDelete(Reviews rv, String rvType) {
        if (rvType.equals(ReviewType.PRODUCT.toString())) {
            Products product = productRepository
                    .findProductById(rv.getReviewId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            int totalReview = product.getTotalReview();
            if (totalReview == 1) {
                product.setTotalReview(0);
                product.setRating(0);
            } else {
                float newRating = (product.getTotalReview() * product.getRating() - rv.getRating())
                        / (product.getTotalReview() - 1);
                product.setTotalReview(product.getTotalReview() - 1);
                product.setRating(newRating);
            }
            productRepository.save(product);
        } else if (rvType.equals(ReviewType.RESTAURANT.toString())) {
            Restaurants res = resRepository
                    .findRestaurantById(rv.getReviewId())
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

            int total_review = res.getTotalReview();
            if (total_review == 1) {
                res.setTotalReview(0);
                res.setRating(0);
            } else {
                float newRating =
                        (res.getTotalReview() * res.getRating() - rv.getRating()) / (res.getTotalReview() - 1);
                res.setTotalReview(res.getTotalReview() - 1);
                res.setRating(newRating);
            }
            resRepository.save(res);
        }
    }

    private void checkAuthority(UUID id, UserRole authUser) {
        if (authUser != null && !authUser.getId().equals(id) && !"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }
}
