package com.CNTTK18.restaurant_service.service.Impl;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.restaurant_service.client.CatalogServiceClient;
import com.CNTTK18.restaurant_service.client.ImageServiceClient;
import com.CNTTK18.restaurant_service.client.ReviewServiceClient;
import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.category.response.CategoryResponse;
import com.CNTTK18.restaurant_service.dto.distance.response.DistanceResponse;
import com.CNTTK18.restaurant_service.dto.product.ProductIdWithRating;
import com.CNTTK18.restaurant_service.dto.product.request.ProductQuery;
import com.CNTTK18.restaurant_service.dto.product.request.ProductRequest;
import com.CNTTK18.restaurant_service.dto.product.request.SizePrice;
import com.CNTTK18.restaurant_service.dto.product.request.UpdateProduct;
import com.CNTTK18.restaurant_service.dto.product.response.ProductResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResWithDistance;
import com.CNTTK18.restaurant_service.dto.size.response.SizeResponse;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.mapper.ProductMapper;
import com.CNTTK18.restaurant_service.mapper.ResMapper;
import com.CNTTK18.restaurant_service.model.ProductSize;
import com.CNTTK18.restaurant_service.model.Products;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.repository.ProductRepository;
import com.CNTTK18.restaurant_service.repository.ResRepository;
import com.CNTTK18.restaurant_service.service.DistanceService;
import com.CNTTK18.restaurant_service.service.ProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepo;
    private final ResRepository resRepository;
    private final CatalogServiceClient catalogServiceClient;
    private final ImageServiceClient imageServiceClient;
    private final ReviewServiceClient reviewServiceClient;
    private final DistanceService distanceService;
    private final ProductMapper productMapper;
    private final ResMapper resMapper;

    @Override
    public Page<ProductResponse> getAllProducts(ProductQuery productQuery, Coordinates location, Pageable pageable) {

        ProductData data = fetchProductData(productQuery, location, pageable);

        if (data.restaurants().isEmpty()) {
            return Page.empty(pageable);
        }

        List<Double> startingPoints = List.of(location.getLongitude(), location.getLatitude());
        List<List<Double>> endPoints = data.restaurants().stream()
                .map(r -> List.of(r.getLongitude(), r.getLatitude()))
                .toList();

        DistanceResponse response = distanceService.getDistanceAndDurationInList(startingPoints, endPoints);

        return buildPageResponse(data, response, productQuery.getRating(), productQuery.getLocationsorted(), pageable);
    }

    @Override
    public ProductResponse getProductById(UUID id) {
        Products product = getById(id);
        return productMapper.toProductResponse(product);
    }

    @Override
    public ProductResponse getProductBySlug(String slug) {
        Products product =
                productRepo.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest, MultipartFile imageFile) {
        CategoryResponse category = catalogServiceClient.getCategory(productRequest.getCategoryId());
        if (category == null) {
            throw new ResourceNotFoundException("category not found");
        }

        Restaurants res = getResById(productRequest.getRestaurantId());

        Products product = Products.builder()
                .id(UUID.randomUUID())
                .productName(productRequest.getProductName())
                .description(productRequest.getDescription())
                .categoryId(productRequest.getCategoryId())
                .restaurant(res)
                .available(productRequest.isAvailable())
                .slug(SlugGenerator.generate(productRequest.getProductName()))
                .build();

        addProductSizes(product, productRequest.getSizeIds());
        setImageIfPresent(product, imageFile);

        productRepo.save(product);
        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(
            UpdateProduct updateProduct, UUID id, MultipartFile imageFile, UserRole authUser) {
        Products product = getById(id);

        CategoryResponse category = catalogServiceClient.getCategory(updateProduct.getCategoryId());
        if (category == null) {
            throw new ResourceNotFoundException("category not found");
        }

        Restaurants res = getResById(product.getRestaurant().getId());

        checkAuthority(res.getMerchantId(), authUser);
        UUID oldCategoryId = product.getCategoryId();
        boolean categoryChanged = !oldCategoryId.equals(updateProduct.getCategoryId());

        if (!product.getProductName().equals(updateProduct.getProductName())) {
            product.setProductName(updateProduct.getProductName());
            product.setSlug(SlugGenerator.generate(updateProduct.getProductName()));
        }

        product.setCategoryId(updateProduct.getCategoryId());
        product.setDescription(updateProduct.getDescription());

        if (updateProduct.getSizeIds() != null) {

            product.clearAllProductSizes();
            for (SizePrice psDto : updateProduct.getSizeIds()) {

                SizeResponse size = catalogServiceClient.getSize(psDto.getSizeId());
                if (size == null) {
                    throw new ResourceNotFoundException("Size not found: " + psDto.getSizeId());
                }

                ProductSize productSize = ProductSize.builder()
                        .sizeId(size.getId())
                        .price(psDto.getPrice())
                        .build();

                product.addProductSize(productSize);
            }
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String oldPublicId = product.getPublicID();
            var image = imageServiceClient.uploadImage(imageFile, "product");
            product.setImageURL(image.get("url"));
            product.setPublicID(image.get("public_id"));

            if (oldPublicId != null && !oldPublicId.isEmpty()) {
                imageServiceClient.deleteImage(oldPublicId);
            }
        }
        productRepo.save(product);
        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id, UserRole authUser) {
        Products product = getById(id);

        checkAuthority(product.getRestaurant().getMerchantId(), authUser);

        if (product.getPublicID() != null && !product.getPublicID().isEmpty()) {
            imageServiceClient.deleteImage(product.getPublicID());
        }

        productRepo.delete(product);
    }

    @Override
    @Transactional
    public void changeProductAvailability(UUID id, UserRole authUser) {
        Products product = getById(id);
        checkAuthority(product.getRestaurant().getMerchantId(), authUser);
        product.setAvailable(!product.isAvailable());
        productRepo.save(product);
    }

    @Override
    @Transactional
    public void deleteImage(UUID productId, UserRole authUser) {
        Products product = getById(productId);
        checkAuthority(product.getRestaurant().getMerchantId(), authUser);
        imageServiceClient.deleteImage(product.getPublicID());
        product.setImageURL(null);
        product.setPublicID(null);
        productRepo.save(product);
    }

    @Override
    public Set<ProductSize> getAllProductSizeOfProduct(UUID id) {
        Products product = getById(id);
        return product.getProductSizes();
    }

    @Override
    public List<ProductResponse> getAllProductsByRestaurantId(UUID id) {
        Restaurants res = getResById(id);

        return productRepo
                .findProductsByRestaurant(res)
                .map(list -> list.stream().map(productMapper::toProductResponse).toList())
                .orElse(List.of());
    }

    @Override
    public ResResponse getRestaurantByProductId(UUID id) {
        Products product = getById(id);

        return resMapper.toResResponse(product.getRestaurant());
    }

    private void addProductSizes(Products product, List<SizePrice> sizePrices) {
        if (sizePrices == null) return;
        for (SizePrice psDto : sizePrices) {
            SizeResponse size = catalogServiceClient.getSize(psDto.getSizeId());
            if (size == null) {
                throw new ResourceNotFoundException("Size not found: " + psDto.getSizeId());
            }
            product.addProductSize(ProductSize.builder()
                    .sizeId(size.getId())
                    .price(psDto.getPrice())
                    .build());
        }
    }

    private void setImageIfPresent(Products product, MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) return;
        var image = imageServiceClient.uploadImage(imageFile, "product");
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

    private ProductData fetchProductData(ProductQuery productQuery, Coordinates location, Pageable pageable) {
        String categoryName = (productQuery.getCategory() != null
                        && !productQuery.getCategory().isBlank())
                ? productQuery.getCategory()
                : null;
        String normalizedSearch =
                (productQuery.getSearch() != null && !productQuery.getSearch().isBlank())
                        ? productQuery.getSearch()
                        : null;
        int normalizedNearby = (productQuery.getNearby() == null || productQuery.getNearby() > 20000)
                ? 20000
                : productQuery.getNearby();
        String sort = productQuery.getRating() != null && "desc".equalsIgnoreCase(productQuery.getRating())
                ? "rating_id_desc"
                : "id_asc";

        Page<ProductIdWithRating> productResult = productRepo.findProductsWithinDistance(
                location.getLongitude(),
                location.getLatitude(),
                normalizedNearby,
                normalizedSearch,
                productQuery.getMaxPrice(),
                productQuery.getMinPrice(),
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
