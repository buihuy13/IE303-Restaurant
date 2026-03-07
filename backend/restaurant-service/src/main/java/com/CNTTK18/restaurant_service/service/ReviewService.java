package com.CNTTK18.restaurant_service.service;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.RandomIdGenerator;
import com.CNTTK18.restaurant_service.data.ReviewType;
import com.CNTTK18.restaurant_service.dto.api.UserResponse;
import com.CNTTK18.restaurant_service.dto.review.request.ReviewRequest;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.exception.InvalidRequestException;
import com.CNTTK18.restaurant_service.model.Products;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.model.Reviews;
import com.CNTTK18.restaurant_service.repository.ProductRepository;
import com.CNTTK18.restaurant_service.repository.ResRepository;
import com.CNTTK18.restaurant_service.repository.ReviewRepository;

@Service
public class ReviewService {
    private ReviewRepository reviewRepo;
    private WebClient.Builder webClientBuilder;
    private ProductRepository productRepository;
    private ResRepository resRepository;

    public ReviewService(
            ReviewRepository reviewRepo,
            WebClient.Builder webClientBuilder,
            ProductRepository productRepository,
            ResRepository resRepository) {
        this.reviewRepo = reviewRepo;
        this.webClientBuilder = webClientBuilder;
        this.productRepository = productRepository;
        this.resRepository = resRepository;
    }

    public Page<Reviews> getAllReviews(String resId, String productId, Pageable pageable) {
        if (resId != null && !resId.isEmpty()) {
            return reviewRepo.findByReviewTypeAndReviewId(ReviewType.RESTAURANT.toString(), resId, pageable);
        }
        if (productId != null && !productId.isEmpty()) {
            return reviewRepo.findByReviewTypeAndReviewId(ReviewType.PRODUCT.toString(), productId, pageable);
        }
        return reviewRepo.findAll(pageable);
    }

    public Reviews getReviewById(String id) {
        Reviews rv = reviewRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return rv;
    }

    @Transactional
    public Reviews createReview(ReviewRequest reviewRequest) {
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
        String rvId = reviewRequest.getReviewId();
        // handle check xem product or restaurant đó có tồn tại hay không
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
        Reviews rv = new Reviews(
                RandomIdGenerator.generate(200),
                reviewRequest.getUserId(),
                rvId,
                rvType,
                reviewRequest.getTitle(),
                reviewRequest.getContent(),
                reviewRequest.getRating(),
                null);

        return reviewRepo.save(rv);
    }

    @Transactional
    public void deleteReview(String id, String userId) {
        if (id != null && userId != null && !userId.equals(id)) {
            throw new ForbiddenException("Bạn không có quyền");
        }
        Reviews rv = reviewRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        String rvType = rv.getReviewType();
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
        reviewRepo.delete(rv);
    }
}
