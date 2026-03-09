package com.CNTTK18.restaurant_service.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.distance.response.DistanceResponse;
import com.CNTTK18.restaurant_service.dto.product.ProductIdWithRating;
import com.CNTTK18.restaurant_service.dto.product.request.ProductRequest;
import com.CNTTK18.restaurant_service.dto.product.request.SizePrice;
import com.CNTTK18.restaurant_service.dto.product.request.UpdateProduct;
import com.CNTTK18.restaurant_service.dto.product.response.ProductResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResWithDistance;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.exception.InvalidRequestException;
import com.CNTTK18.restaurant_service.mapper.ProductMapper;
import com.CNTTK18.restaurant_service.mapper.ResMapper;
import com.CNTTK18.restaurant_service.model.Categories;
import com.CNTTK18.restaurant_service.model.ProductSize;
import com.CNTTK18.restaurant_service.model.Products;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.model.Reviews;
import com.CNTTK18.restaurant_service.model.Size;
import com.CNTTK18.restaurant_service.model.data.ReviewType;
import com.CNTTK18.restaurant_service.repository.CateRepository;
import com.CNTTK18.restaurant_service.repository.ProductRepository;
import com.CNTTK18.restaurant_service.repository.ResRepository;
import com.CNTTK18.restaurant_service.repository.ReviewRepository;
import com.CNTTK18.restaurant_service.repository.SizeRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepo;
    private final CateRepository cateRepository;
    private final ResRepository resRepository;
    private final SizeRepository sizeRepository;
    private final ImageHandleService imageFileService;
    private final ReviewRepository reviewRepository;
    private final DistanceService distanceService;
    private final ProductMapper productMapper;
    private final ResMapper resMapper;

    public Mono<Page<ProductResponse>> getAllProducts(
            String rating,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search,
            Integer nearby,
            Coordinates location,
            String locationsorted,
            Pageable pageable) {

        if (location == null) {
            throw new InvalidRequestException("longitude and latitude is mandatory");
        }

        return Mono.fromCallable(() ->
                        fetchProductData(rating, category, minPrice, maxPrice, search, nearby, location, pageable))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(data -> {
                    if (data.restaurants().isEmpty()) {
                        return Mono.just(Page.empty(pageable));
                    }

                    List<Double> startingPoints = List.of(location.getLongitude(), location.getLatitude());
                    List<List<Double>> endPoints = data.restaurants().stream()
                            .map(r -> List.of(r.getLongitude(), r.getLatitude()))
                            .toList();

                    return distanceService
                            .getDistanceAndDurationInList(startingPoints, endPoints)
                            .map(response -> buildPageResponse(data, response, rating, locationsorted, pageable));
                });
    }

    public ProductResponse getProductById(UUID id) {
        Products product = getById(id);
        return productMapper.toProductResponse(product);
    }

    public ProductResponse getProductBySlug(String slug) {
        Products product =
                productRepo.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toProductResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest, MultipartFile imageFile) {
        Categories cate = cateRepository
                .findById(productRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("category not found"));

        Restaurants res = getResById(productRequest.getRestaurantId());

        Products product = Products.builder()
                .id(UUID.randomUUID())
                .productName(productRequest.getProductName())
                .description(productRequest.getDescription())
                .category(cate)
                .restaurant(res)
                .available(productRequest.isAvailable())
                .slug(SlugGenerator.generate(productRequest.getProductName()))
                .build();
        // Check cate
        if (!res.getCategories().contains(cate)) {
            res.getCategories().add(cate);
            resRepository.save(res);
        }
        addProductSizes(product, productRequest.getSizeIds());
        setImageIfPresent(product, imageFile);

        productRepo.save(product);
        return productMapper.toProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(
            UpdateProduct updateProduct, UUID id, MultipartFile imageFile, UserRole authUser) {
        Products product = getById(id);

        Categories cate = cateRepository
                .findById(updateProduct.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("category not found"));

        Restaurants res = getResById(product.getRestaurant().getId());

        checkAuthority(res.getMerchantId(), authUser);
        Categories oldCategory = product.getCategory();
        boolean categoryChanged = !oldCategory.getId().equals(cate.getId());

        if (categoryChanged) {
            Long count = productRepo.countProductWithCateIdWithInRes(
                    product.getCategory().getId(), product.getRestaurant().getId());
            if (count == 1) {
                res.getCategories().remove(product.getCategory());
            }
        }

        if (!product.getProductName().equals(updateProduct.getProductName())) {
            product.setProductName(updateProduct.getProductName());
            product.setSlug(SlugGenerator.generate(updateProduct.getProductName()));
        }

        product.setCategory(cate);
        product.setDescription(updateProduct.getDescription());

        if (!res.getCategories().contains(cate)) {
            res.getCategories().add(cate);
        }

        resRepository.save(res);

        if (updateProduct.getSizeIds() != null) {

            product.clearAllProductSizes();
            for (SizePrice psDto : updateProduct.getSizeIds()) {

                Size size = sizeRepository
                        .findById(psDto.getSizeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Size not found: " + psDto.getSizeId()));

                // Tạo ProductSize entity
                ProductSize productSize =
                        ProductSize.builder().size(size).price(psDto.getPrice()).build();

                product.addProductSize(productSize);
            }
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String oldPublicId = product.getPublicID();
            Map<String, String> image = imageFileService.saveImageFile(imageFile);
            product.setImageURL(image.get("url"));
            product.setPublicID(image.get("public_id"));

            if (oldPublicId != null && !oldPublicId.isEmpty()) {
                imageFileService.deleteImage(oldPublicId);
            }
        }
        productRepo.save(product);
        return productMapper.toProductResponse(product);
    }

    @Transactional
    public void deleteProduct(UUID id, UserRole authUser) {
        Products product = getById(id);

        checkAuthority(product.getRestaurant().getMerchantId(), authUser);
        List<Reviews> rv = reviewRepository.findByReviewIdAndReviewType(id, ReviewType.PRODUCT.toString());

        if (product.getPublicID() != null && !product.getPublicID().isEmpty()) {
            imageFileService.deleteImage(product.getPublicID());
        }
        Long count = productRepo.countProductWithCateIdWithInRes(
                product.getCategory().getId(), product.getRestaurant().getId());
        if (count == 1) {
            Restaurants res = product.getRestaurant();
            Categories cate = product.getCategory();
            res.getCategories().remove(cate);
            resRepository.save(res);
        }
        reviewRepository.deleteAll(rv);
        productRepo.delete(product);
    }

    @Transactional
    public void changeProductAvailability(UUID id, UserRole authUser) {
        Products product = getById(id);
        checkAuthority(product.getRestaurant().getMerchantId(), authUser);
        product.setAvailable(!product.isAvailable());
        productRepo.save(product);
    }

    public void deleteImage(UUID productId, UserRole authUser) {
        Products product = getById(productId);
        checkAuthority(product.getRestaurant().getMerchantId(), authUser);
        imageFileService.deleteImage(product.getPublicID());
        product.setImageURL(null);
        product.setPublicID(null);
        productRepo.save(product);
    }

    public Set<ProductSize> getAllProductSizeOfProduct(UUID id) {
        Products product = getById(id);
        return product.getProductSizes();
    }

    public List<ProductResponse> getAllProductsByRestaurantId(UUID id) {
        Restaurants res = getResById(id);

        return productRepo
                .findProductsByRestaurant(res)
                .map(list -> list.stream().map(productMapper::toProductResponse).toList())
                .orElse(List.of());
    }

    public Restaurants getRestaurantByProductId(UUID id) {
        Products product = getById(id);

        return product.getRestaurant();
    }

    private void addProductSizes(Products product, List<SizePrice> sizePrices) {
        if (sizePrices == null) return;
        for (SizePrice psDto : sizePrices) {
            Size size = sizeRepository
                    .findById(psDto.getSizeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Size not found: " + psDto.getSizeId()));
            product.addProductSize(
                    ProductSize.builder().size(size).price(psDto.getPrice()).build());
        }
    }

    private void setImageIfPresent(Products product, MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) return;
        Map<String, String> image = imageFileService.saveImageFile(imageFile);
        product.setImageURL(image.get("url"));
        product.setPublicID(image.get("public_id"));
    }

    private List<ProductResponse> sortProductResponse(
            List<ProductResponse> products, String rating, String locationsorted) {
        if (rating != null && "desc".equalsIgnoreCase(rating)) {
            products.sort(Comparator.comparing(ProductResponse::getRating).reversed());
        } else if (locationsorted != null && "asc".equals(locationsorted)) {
            products.sort(Comparator.comparing(p -> p.getDistance()));
        }
        return products;
    }

    private Products getById(UUID id) {
        Products product =
                productRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return product;
    }

    private Restaurants getResById(UUID id) {
        Restaurants res =
                resRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        return res;
    }

    private record ProductData(
            Page<ProductIdWithRating> productResult, List<Products> products, List<Restaurants> restaurants) {}

    private ProductData fetchProductData(
            String rating,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search,
            Integer nearby,
            Coordinates location,
            Pageable pageable) {

        String categoryName = (category != null && !category.isBlank()) ? category : null;

        String normalizedSearch = (search != null && !search.isBlank()) ? search : null;
        int normalizedNearby = (nearby == null || nearby > 20000) ? 20000 : nearby;
        String sort = rating != null && "desc".equalsIgnoreCase(rating) ? "rating_id_desc" : "id_asc";

        Page<ProductIdWithRating> productResult = productRepo.findProductsWithinDistance(
                location.getLongitude(),
                location.getLatitude(),
                normalizedNearby,
                normalizedSearch,
                categoryName,
                maxPrice,
                minPrice,
                sort,
                pageable);

        List<UUID> productIds = productResult.getContent().stream()
                .map(ProductIdWithRating::getId)
                .toList();

        List<Products> products = productRepo.findByIdIn(productIds);
        List<Restaurants> restaurants =
                products.stream().map(Products::getRestaurant).distinct().toList();

        return new ProductData(productResult, products, restaurants);
    }

    private Page<ProductResponse> buildPageResponse(
            ProductData data, DistanceResponse response, String rating, String locationsorted, Pageable pageable) {

        List<Double> durations = response.getDurations().get(0);
        List<Double> distances = response.getDistances().get(0);

        Map<UUID, ResWithDistance> resResponseMap = IntStream.range(
                        0, data.restaurants().size())
                .mapToObj(i -> {
                    ResWithDistance resResponse = resMapper.toResResponseWithDistanceAndDuration(
                            data.restaurants().get(i), distances.get(i), durations.get(i));
                    return resResponse;
                })
                .collect(Collectors.toMap(ResWithDistance::getId, Function.identity()));

        List<ProductResponse> productResponses = data.products().stream()
                .map(p -> {
                    ResWithDistance resResponse =
                            resResponseMap.get(p.getRestaurant().getId());
                    return productMapper.toProductResponse(p, resResponse.getDistance(), resResponse.getDuration());
                })
                .collect(Collectors.toList());

        productResponses = sortProductResponse(productResponses, rating, locationsorted);
        return new PageImpl<>(productResponses, pageable, data.productResult().getTotalElements());
    }

    private void checkAuthority(UUID id, UserRole authUser) {
        if (authUser != null && !authUser.getId().equals(id) && !"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }
}
