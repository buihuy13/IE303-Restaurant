# Dashboard Service Refactoring Plan

## Overview

Refactor the `dashboard-service` to be compatible with the refactored microservices architecture, implement Redis caching for performance, and use `CompletableFuture` for parallel async operations.

## Current State Analysis

### Existing Controllers
- `DashboardController` - Admin dashboard analytics (orders, revenue, top products)
- `MerchantDashboardController` - Merchant-specific analytics
- `RestaurantAdminStatsController` - Restaurant statistics for admin
- `UserAdminStatsController` - User statistics for admin

### Existing Feign Clients
- `OrderDashboardDataClient` - Order data from order-service
- `RestaurantDashboardDataClient` - Restaurant data from restaurant-service
- `UserDashboardDataClient` - User data from user-service

### Problem Areas After Refactoring

1. **Restaurant Counts API**: Currently returns `totalProducts = 0` because products moved to product-service
2. **Average Rating**: Returns hardcoded `0D` because rating logic moved to review-service
3. **Category Count**: Fetches from catalog-service but counts sizes instead of categories
4. **No Caching**: All requests hit downstream services directly
5. **Sequential Calls**: Service calls are synchronous, not parallel

## New Service Architecture (CQRS-Based)

```
dashboard-service
├── Query Service (CQRS read model)
│   ├── Restaurant read models (with categories, ratings)
│   └── Product read models (with categories, sizes, ratings)
├── Order Service (transactional data)
│   └── Revenue, order statistics, hourly data
├── User Service
│   └── User counts and growth metrics
├── Catalog Service (reference data)
│   └── Category/Size counts
└── Review Service (detailed analytics)
    └── Rating distributions, review trends
├── Caching: Redis
└── Async: CompletableFuture for parallel calls
```

**Why use query-service instead of product/restaurant-services?**

| Aspect | Using Product/Restaurant Services | Using Query Service |
|--------|-----------------------------------|---------------------|
| **Data Join** | Multiple service calls needed | Pre-joined data |
| **Performance** | N+1 query problem | Optimized read models |
| **CQRS Alignment** | Read from command side | Dedicated read side |
| **Consistency** | Strong consistency | Eventual consistency (acceptable for dashboard) |
| **Dependencies** | 2 services | 1 service |

## Implementation Plan

### Phase 1: Add New Feign Clients

Create new Feign clients for the refactored services:

#### 1.1 Query Service Client (CQRS Read Model)

**File:** `client/QueryDashboardDataClient.java`

```java
@FeignClient(name = "query-service")
public interface QueryDashboardDataClient {
    @GetMapping("/internal/dashboard/restaurants/count")
    long countRestaurants();

    @GetMapping("/internal/dashboard/products/count")
    long countProducts();

    @GetMapping("/internal/dashboard/products/count-by-restaurant")
    long countProductsByRestaurant(@RequestParam("restaurantId") UUID restaurantId);

    @GetMapping("/internal/dashboard/restaurants/average-rating")
    Double getAverageRestaurantRating();

    @GetMapping("/internal/dashboard/products/average-rating")
    Double getAverageProductRating();

    @GetMapping("/internal/dashboard/reviews/count")
    long countTotalReviews();

    @GetMapping("/internal/dashboard/reviews/count-by-restaurant")
    long countReviewsByRestaurant(@RequestParam("restaurantId") UUID restaurantId);
}
```

#### 1.2 Catalog Service Client

#### 1.2 Catalog Service Client

**File:** `client/CatalogDashboardDataClient.java`

```java
@FeignClient(name = "catalog-service")
public interface CatalogDashboardDataClient {
    @GetMapping("/internal/dashboard/categories/count")
    long countCategories();

    @GetMapping("/internal/dashboard/sizes/count")
    long countSizes();
}
```

#### 1.3 Review Service Client

**File:** `client/ReviewDashboardDataClient.java`

```java
@FeignClient(name = "review-service")
public interface ReviewDashboardDataClient {
    @GetMapping("/api/review/stats/restaurant/{id}")
    ReviewStatsResponse getRestaurantStats(@PathVariable("id") UUID restaurantId);

    @GetMapping("/api/review/stats/product/{id}")
    ReviewStatsResponse getProductStats(@PathVariable("id") UUID productId);

    @GetMapping("/internal/dashboard/reviews/rating-distribution")
    Map<Integer, Long> getGlobalRatingDistribution();
}
```

**Note:** Basic counts and averages are now handled by query-service. Review-service is only needed for detailed analytics like rating distributions.

### Phase 2: Add Redis Configuration

#### 2.1 Update build.gradle.kts

Add dependencies:
```kotlin
implementation("org.springframework.boot:spring-boot-starter-data-redis")
implementation("org.springframework.boot:spring-boot-starter-cache")
```

#### 2.2 Create Redis Configuration

**File:** `config/RedisConfig.java`

```java
@Configuration
@EnableCaching
public class RedisConfig {
    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues()
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}
```

#### 2.3 Cache Properties

**File:** `config/properties/CacheProperties.java`

```java
@ConfigurationProperties(prefix = "cache")
@Data
public class CacheProperties {
    private Duration overviewTtl = Duration.ofMinutes(5);
    private Duration statsTtl = Duration.ofMinutes(10);
    private Duration revenueTtl = Duration.ofMinutes(2);
}
```

### Phase 3: Cache Configuration (Simple Approach)

**Use Spring's built-in cache annotations directly - no separate cache service needed!**

```java
// Example: Cache a method result
@Cacheable(value = "overview", key = "'admin'")
public OverviewResponse getOverview() { ... }

// Example: Evict cache when data changes
@CacheEvict(value = "overview", allEntries = true)
public void onOrderCreated(OrderCreatedEvent event) { ... }

// Example: Update cache without interfering with method
@CachePut(value = "merchant-stats", key = "#restaurantId")
public StatsResponse updateStats(UUID restaurantId) { ... }
```

### Phase 4: Create Async Aggregation Service with CompletableFuture

**File:** `service/AsyncDashboardDataService.java`

```java
public interface AsyncDashboardDataService {
    CompletableFuture<DashboardStatsDTO.OverviewResponse> getOverviewAsync();
    CompletableFuture<RestaurantAdminStatsResponse> getRestaurantStatsAsync();
    CompletableFuture<DashboardStatsDTO.OverviewResponse> getMerchantOverviewAsync(UUID restaurantId);
}
```

**File:** `service/Impl/AsyncDashboardDataServiceImpl.java`

```java
@Service
@RequiredArgsConstructor
public class AsyncDashboardDataServiceImpl implements AsyncDashboardDataService {
    private final OrderDashboardDataClient orderClient;
    private final UserDashboardDataClient userClient;
    private final QueryDashboardDataClient queryClient;
    private final CatalogDashboardDataClient catalogClient;

    @Override
    @Cacheable(value = "overview", key = "'admin'")
    public CompletableFuture<DashboardStatsDTO.OverviewResponse> getOverviewAsync() {
        // Parallel calls to all services (query-service handles restaurants/products/reviews)
        CompletableFuture<Long> pendingOrders = supplyAsync(() -> orderClient.countByStatus(OrderStatus.PENDING));
        CompletableFuture<Long> completedOrders = supplyAsync(() -> orderClient.countByStatus(OrderStatus.COMPLETED));
        CompletableFuture<Long> cancelledOrders = supplyAsync(() -> orderClient.countByStatus(OrderStatus.CANCELLED));
        CompletableFuture<Long> totalUsers = supplyAsync(() -> userClient.countUsers());
        CompletableFuture<Long> totalRestaurants = supplyAsync(() -> queryClient.countRestaurants());
        CompletableFuture<Long> totalProducts = supplyAsync(() -> queryClient.countProducts());
        CompletableFuture<Long> totalCategories = supplyAsync(() -> catalogClient.countCategories());
        CompletableFuture<Double> avgRating = supplyAsync(() -> queryClient.getAverageRestaurantRating());

        // Combine all futures
        return CompletableFuture.allOf(pendingOrders, completedOrders, cancelledOrders,
                totalUsers, totalRestaurants, totalProducts, totalCategories, avgRating)
            .thenApply(voidResult -> buildOverview(
                pendingOrders.join(), completedOrders.join(), cancelledOrders.join(),
                totalUsers.join(), totalRestaurants.join(), totalProducts.join(),
                totalCategories.join(), avgRating.join()
            ));
    }

    private DashboardStatsDTO.OverviewResponse buildOverview(
            Long pendingOrders, Long completedOrders, Long cancelledOrders,
            Long totalUsers, Long totalRestaurants, Long totalProducts,
            Long totalCategories, Double avgRating) {
        return DashboardStatsDTO.OverviewResponse.builder()
            .pendingOrders(pendingOrders)
            .completedOrders(completedOrders)
            .cancelledOrders(cancelledOrders)
            .totalUsers(totalUsers)
            .totalRestaurants(totalRestaurants)
            .totalProducts(totalProducts)
            .totalCategories(totalCategories)
            .averageRating(avgRating != null ? avgRating : 0.0)
            .build();
    }
}
```

### Phase 5: Update Existing Services

#### 5.1 Update RestaurantStatsAggregationServiceImpl

**File:** `service/Impl/RestaurantStatsAggregationServiceImpl.java`

Changes:
1. Use `QueryDashboardDataClient` for product counts and average rating (CQRS read model)
2. Use `CatalogDashboardDataClient` for category counts
3. Add `@Cacheable` annotation
4. Return `CompletableFuture` instead of direct response

```java
@Service
@RequiredArgsConstructor
public class RestaurantStatsAggregationServiceImpl implements RestaurantStatsAggregationService {
    private final QueryDashboardDataClient queryClient;
    private final CatalogDashboardDataClient catalogClient;

    @Override
    @Cacheable(value = "restaurant-stats", key = "'admin'")
    public CompletableFuture<RestaurantAdminStatsResponse> getAdminStats() {
        CompletableFuture<Long> totalRestaurants = supplyAsync(() -> queryClient.countRestaurants());
        CompletableFuture<Long> totalProducts = supplyAsync(() -> queryClient.countProducts());
        CompletableFuture<Long> totalCategories = supplyAsync(() -> catalogClient.countCategories());
        CompletableFuture<Double> avgRating = supplyAsync(() ->
            Optional.ofNullable(queryClient.getAverageRestaurantRating()).orElse(0.0));
        CompletableFuture<Long> totalReviews = supplyAsync(() -> queryClient.countTotalReviews());

        return CompletableFuture.allOf(totalRestaurants, totalProducts, totalCategories, avgRating, totalReviews)
            .thenApply(voidResult -> RestaurantAdminStatsResponse.builder()
                .totalRestaurants(totalRestaurants.join())
                .totalProducts(totalProducts.join())
                .totalCategories(totalCategories.join())
                .averageRating(avgRating.join())
                .totalReviews(totalReviews.join())
                .build());
    }
}
```

**Note:** `RestaurantAdminStatsResponse` DTO should be updated to include `totalReviews` field.

#### 5.2 Update DashboardAnalyticsServiceImpl

Changes:
1. Wrap all Feign calls in `supplyAsync()`
2. Use `CompletableFuture.allOf()` for parallel execution
3. Add `@Cacheable` annotations with appropriate TTL
4. Remove old `RestaurantDashboardDataClient` dependency (replaced by `QueryDashboardDataClient`)

```java
@Service
@RequiredArgsConstructor
public class DashboardAnalyticsServiceImpl implements DashboardAnalyticsService {
    private final OrderDashboardDataClient orderClient;
    private final QueryDashboardDataClient queryClient;
    private final CatalogDashboardDataClient catalogClient;

    @Override
    @Cacheable(value = "overview", key = "'admin'")
    public CompletableFuture<DashboardStatsDTO.OverviewResponse> getOverview() {
        // Delegates to AsyncDashboardDataService
    }

    @Override
    @Cacheable(value = "revenue", key = "'revenue-' + #period")
    public CompletableFuture<DashboardStatsDTO.RevenueResponse> getRevenue(String period) {
        // Revenue still comes from order-service (transactional data)
        DateRange range = getRange(period);
        return supplyAsync(() -> orderClient.revenueByDay(range.start().toString(), range.end().toString()))
            .thenApply(this::buildRevenueResponse);
    }
}
```

#### 5.3 Update MerchantDashboardAnalyticsServiceImpl

Similar async pattern with restaurant-specific caching keys:

```java
@Override
@Cacheable(value = "merchant-overview", key = "#restaurantId")
public CompletableFuture<DashboardStatsDTO.OverviewResponse> getMerchantOverview(UUID restaurantId) {
    // Async implementation with restaurantId
}
```

### Phase 6: Update Controllers

#### 6.1 Update DashboardController

Change return types from `ResponseEntity<T>` to `CompletableFuture<ResponseEntity<T>>`:

```java
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final AsyncDashboardDataService asyncDashboardService;

    @GetMapping("/overview")
    public CompletableFuture<ResponseEntity<DashboardStatsDTO.OverviewResponse>> getOverview() {
        return asyncDashboardService.getOverviewAsync()
            .thenApply(ResponseEntity::ok);
    }
}
```

#### 6.2 Update RestaurantAdminStatsController

```java
@GetMapping("/stats")
public CompletableFuture<ResponseEntity<RestaurantAdminStatsResponse>> getAdminStats() {
    return restaurantStatsAggregationService.getAdminStats()
        .thenApply(ResponseEntity::ok);
}
```

### Phase 7: Add Internal Endpoints to Other Services

For dashboard-service to work, other services need to expose internal endpoints:

#### 7.1 Query Service (CQRS Read Model)

**File:** `query-service/src/main/java/.../controller/InternalDashboardQueryController.java`

```java
@RestController
@RequestMapping("/internal/dashboard")
@RequiredArgsConstructor
public class InternalDashboardQueryController {
    private final RestaurantReadModelRepository restaurantRepository;
    private final ProductReadModelRepository productRepository;

    @GetMapping("/restaurants/count")
    public ResponseEntity<Long> countRestaurants() {
        return ResponseEntity.ok(restaurantRepository.count());
    }

    @GetMapping("/products/count")
    public ResponseEntity<Long> countProducts() {
        return ResponseEntity.ok(productRepository.count());
    }

    @GetMapping("/products/count-by-restaurant")
    public ResponseEntity<Long> countProductsByRestaurant(@RequestParam UUID restaurantId) {
        return ResponseEntity.ok(productRepository.countByRestaurantId(restaurantId));
    }

    @GetMapping("/restaurants/average-rating")
    public ResponseEntity<Double> getAverageRestaurantRating() {
        return ResponseEntity.ok(
            restaurantRepository.findAll().stream()
                .filter(r -> r.getAverageRating() != null)
                .mapToDouble(RestaurantReadModel::getAverageRating)
                .average()
                .orElse(0.0)
        );
    }

    @GetMapping("/products/average-rating")
    public ResponseEntity<Double> getAverageProductRating() {
        return ResponseEntity.ok(
            productRepository.findAll().stream()
                .filter(p -> p.getAverageRating() != null)
                .mapToDouble(ProductReadModel::getAverageRating)
                .average()
                .orElse(0.0)
        );
    }

    @GetMapping("/reviews/count")
    public ResponseEntity<Long> countTotalReviews() {
        // Count reviews embedded in read models
        long restaurantReviews = restaurantRepository.findAll().stream()
            .mapToLong(r -> r.getTotalReviews() != null ? r.getTotalReviews() : 0L)
            .sum();
        long productReviews = productRepository.findAll().stream()
            .mapToLong(p -> p.getTotalReviews() != null ? p.getTotalReviews() : 0L)
            .sum();
        return ResponseEntity.ok(restaurantReviews + productReviews);
    }

    @GetMapping("/reviews/count-by-restaurant")
    public ResponseEntity<Long> countReviewsByRestaurant(@RequestParam UUID restaurantId) {
        return restaurantRepository.findById(restaurantId)
            .map(r -> ResponseEntity.ok(r.getTotalReviews() != null ? r.getTotalReviews() : 0L))
            .orElse(ResponseEntity.ok(0L));
    }
}
```

**Note:** Query service read models should have `averageRating` and `totalReviews` fields populated by events from review-service.

#### 7.2 Catalog Service

**File:** `catalog-service/src/main/java/.../controller/InternalDashboardCatalogController.java`

```java
@RestController
@RequestMapping("/internal/dashboard")
@RequiredArgsConstructor
public class InternalDashboardCatalogController {
    private final CategoryRepository categoryRepository;
    private final SizeRepository sizeRepository;

    @GetMapping("/categories/count")
    public ResponseEntity<Long> countCategories() {
        return ResponseEntity.ok(categoryRepository.count());
    }

    @GetMapping("/sizes/count")
    public ResponseEntity<Long> countSizes() {
        return ResponseEntity.ok(sizeRepository.count());
    }
}
```

#### 7.3 Review Service (Optional - For Detailed Analytics)

Basic rating counts and averages are handled by query-service. Review-service endpoints are only needed for detailed rating distribution analytics.

**File:** `review-service/src/main/java/.../controller/InternalDashboardReviewController.java`

```java
@RestController
@RequestMapping("/internal/dashboard/reviews")
@RequiredArgsConstructor
public class InternalDashboardReviewController {
    private final ReviewRepository reviewRepository;

    @GetMapping("/rating-distribution")
    public ResponseEntity<Map<Integer, Long>> getGlobalRatingDistribution() {
        return ResponseEntity.ok(
            reviewRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                    Review::getRating,
                    Collectors.counting()
                ))
        );
    }
}
```

### Phase 8: Application Configuration

**File:** `src/main/resources/application.yml`

```yaml
spring:
  application:
    name: dashboard-service
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
  cache:
    type: redis
    redis:
      time-to-live: 600000 # 10 minutes default
      cache-null-values: false

cache:
  overview-ttl: 5m
  stats-ttl: 10m
  revenue-ttl: 2m
```

### Phase 9: Update Dockerfile

**File:** `dashboard-service/Dockerfile`

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Phase 10: Update docker-compose.yml

Ensure Redis is available and dashboard-service connects to it:

```yaml
dashboard-service:
  build:
    context: ./backend
    dockerfile: ./dashboard-service/Dockerfile
    args:
      MODULE_PATH: dashboard-service
  env_file:
    - ./.env
  environment:
    - PORT=${DASHBOARD_PORT}
    - SPRING_DATA_REDIS_HOST=redis
    - SPRING_DATA_REDIS_PORT=6379
    - SPRING_DATA_REDIS_PASSWORD=${REDIS_PASSWORD}
  depends_on:
    redis:
      condition: service_healthy
    service-discovery:
      condition: service_started
```

## File Changes Summary

### New Files to Create

| Path | Description | Required |
|------|-------------|----------|
| `client/QueryDashboardDataClient.java` | Feign client for query-service (CQRS read model) | ✅ |
| `client/CatalogDashboardDataClient.java` | Feign client for catalog-service | ✅ |
| `client/ReviewDashboardDataClient.java` | Feign client for review-service (detailed analytics) | ✅ |
| `config/RedisConfig.java` | Redis cache configuration | ✅ |
| `config/AsyncConfig.java` | Custom executor for async operations | ✅ |
| `service/AsyncDashboardDataService.java` | Async aggregation interface | ✅ |
| `service/Impl/AsyncDashboardDataServiceImpl.java` | Async aggregation with CompletableFuture | ✅ |
| `controller/CacheManagementController.java` | Admin cache eviction endpoint | ❌ Optional |

### Files to Remove

| Location | Path | Reason |
|----------|------|--------|
| dashboard-service | `client/RestaurantDashboardDataClient.java` | Replaced by QueryDashboardDataClient |
| dashboard-service | `dto/restaurant/RestaurantCountsResponse.java` | No longer needed |
| restaurant-service | `controller/InternalDashboardRestaurantController.java` | ✅ **Already removed** - using query-service instead |

### Files to Modify

| Path | Changes |
|------|---------|
| `service/Impl/DashboardAnalyticsServiceImpl.java` | Add @Cacheable, use CompletableFuture |
| `service/Impl/MerchantDashboardAnalyticsServiceImpl.java` | Add @Cacheable, use CompletableFuture |
| `service/Impl/RestaurantStatsAggregationServiceImpl.java` | Add @Cacheable, use CompletableFuture, use new clients |
| `service/Impl/UserStatsAggregationServiceImpl.java` | Add @Cacheable, use CompletableFuture |
| `controller/DashboardController.java` | Return CompletableFuture |
| `controller/MerchantDashboardController.java` | Return CompletableFuture |
| `controller/RestaurantAdminStatsController.java` | Return CompletableFuture |
| `controller/UserAdminStatsController.java` | Return CompletableFuture |
| `build.gradle.kts` | Add Redis dependencies |

### Files to Create in Other Services

| Service | Path | Description |
|---------|------|-------------|
| query-service | `controller/InternalDashboardQueryController.java` | Restaurant/product count & rating endpoints |
| catalog-service | `controller/InternalDashboardCatalogController.java` | Category/size count endpoints |
| review-service | `controller/InternalDashboardReviewController.java` | Rating distribution (optional) |

### Files to Remove from dashboard-service

| Path | Reason |
|------|--------|
| `client/RestaurantDashboardDataClient.java` | Replaced by QueryDashboardDataClient |
| Remove usage of `product-service` | Using query-service instead |

## Caching Strategy

### Cache Keys

| Cache Name | Key Pattern | TTL | Eviction Trigger |
|------------|-------------|-----|------------------|
| overview | `admin`, `merchant:{restaurantId}` | 5 minutes | New order, user registration |
| restaurant-stats | `admin` | 10 minutes | New restaurant, product |
| revenue | `revenue:{period}:{restaurantId?}` | 2 minutes | New order, order status change |
| top-products | `top:{period}:{restaurantId?}` | 10 minutes | New order |
| user-stats | `admin` | 10 minutes | New user registration |

### Cache Eviction Strategy

1. **Time-based**: TTL expiration (configured per cache) - Automatic
2. **Event-based**: Use `@CacheEvict` on event listeners
   ```java
   @RabbitListener(queues = "order.created")
   @CacheEvict(value = {"revenue", "overview"}, allEntries = true)
   public void handleOrderCreated(OrderCreatedEvent event) { ... }
   ```
3. **Manual** (optional): Admin endpoint to clear specific caches

## CompletableFuture Usage Patterns

### Pattern 1: Parallel Independent Calls

```java
public CompletableFuture<Response> getOverview() {
    CompletableFuture<Long> future1 = supplyAsync(() -> service1.getData());
    CompletableFuture<Long> future2 = supplyAsync(() -> service2.getData());
    CompletableFuture<Long> future3 = supplyAsync(() -> service3.getData());

    return CompletableFuture.allOf(future1, future2, future3)
        .thenApply(v -> buildResponse(future1.join(), future2.join(), future3.join()));
}
```

### Pattern 2: Parallel with Fallback

```java
public CompletableFuture<Response> getWithFallback() {
    CompletableFuture<Data> primaryFuture = supplyAsync(() -> primaryService.getData())
        .exceptionally(ex -> fallbackData);

    CompletableFuture<Other> otherFuture = supplyAsync(() -> otherService.getData());

    return CompletableFuture.allOf(primaryFuture, otherFuture)
        .thenApply(v -> buildResponse(primaryFuture.join(), otherFuture.join()));
}
```

### Pattern 3: Chained Dependent Calls

```java
public CompletableFuture<Response> getChained() {
    return supplyAsync(() -> service1.getId())
        .thenCompose(id -> supplyAsync(() -> service2.getDataById(id)))
        .thenApply(data -> buildResponse(data));
}
```

## Testing Strategy

### Unit Tests

1. **Service Layer Tests**: Mock all Feign clients, verify cache annotations
2. **Cache Tests**: Verify TTL, eviction, and cache hits/misses
3. **Async Tests**: Verify CompletableFuture behavior and parallel execution

### Integration Tests

1. **End-to-End**: Start all services, verify dashboard data accuracy
2. **Performance**: Measure response time improvement with caching
3. **Failure Scenarios**: Test fallback behavior when services are down

### Performance Targets

| Endpoint | Target (without cache) | Target (with cache) |
|----------|------------------------|---------------------|
| /overview | < 500ms | < 50ms |
| /revenue | < 300ms | < 50ms |
| /restaurant/stats | < 200ms | < 50ms |
| /merchant/overview | < 400ms | < 50ms |

## Implementation Order

1. **Step 1**: Add internal dashboard endpoints to query-service, catalog-service
2. **Step 2**: Create new Feign clients in dashboard-service (Query, Catalog)
3. **Step 3**: Add Redis configuration and dependencies
4. **Step 4**: Create AsyncConfig for custom executor
5. **Step 5**: Implement async dashboard data service with CompletableFuture and @Cacheable
6. **Step 6**: Update existing service implementations (use query-service, add @Cacheable)
7. **Step 7**: Update controllers to return CompletableFuture
8. **Step 8**: (Optional) Add cache management controller for manual eviction
9. **Step 9**: Update docker-compose configuration
10. **Step 10**: Test and verify

## Potential Issues and Solutions

### Issue 1: CompletableFuture Exception Handling

**Problem**: If one service fails, the entire request fails.
**Solution**: Use `.exceptionally()` to provide fallback values.

```java
CompletableFuture<Long> future = supplyAsync(() -> service.getData())
    .exceptionally(ex -> {
        log.error("Service failed, using fallback", ex);
        return 0L; // fallback value
    });
```

### Issue 2: Cache Invalidation

**Problem**: Stale cache data after updates.
**Solution**: Implement event-based cache invalidation via RabbitMQ.

### Issue 3: Redis Connection Failures

**Problem**: Dashboard service fails if Redis is down.
**Solution**: Use fallback to direct service calls when cache is unavailable.

### Issue 4: Thread Pool Exhaustion

**Problem**: Too many async operations can exhaust the thread pool.
**Solution**: Configure custom executor for dashboard operations.

```java
@Configuration
public class AsyncConfig {
    @Bean(name = "dashboardExecutor")
    public Executor dashboardExecutor() {
        return new ThreadPoolExecutor(
            10, 20, 60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(100)
        );
    }
}
```

## API Gateway Routes

Add to `api-gateway/src/main/resources/application.yml`:

```yaml
- id: dashboard-service
  uri: lb://dashboard-service
  predicates:
    - Path=/api/dashboard/**
  filters:
    - StripPrefix=0

- id: dashboard-service-docs
  uri: lb://dashboard-service
  predicates:
    - Path=/v3/api-docs/dashboard-service/**
  filters:
    - RewritePath=/v3/api-docs/dashboard-service/(?<segment>.*), /api-docs/${segment}
```

## Summary

This refactoring will:
1. ✅ Make dashboard-service compatible with refactored microservices (using CQRS)
2. ✅ Use query-service for restaurant/product data (single source of truth for reads)
3. ✅ Add Redis caching using standard Spring `@Cacheable` annotations (no manual cache service)
4. ✅ Use CompletableFuture for parallel async operations
5. ✅ Maintain backward compatibility with existing APIs

### Simplified Caching Approach

**No separate cache service needed!** Just use Spring annotations:
- `@Cacheable` - Cache method results
- `@CacheEvict` - Evict on data changes (via event listeners)
- `@CachePut` - Update cache
- TTL configured via `application.yml`

### Architecture Decision: Why Query-Service?

Using query-service instead of directly calling product-service and restaurant-service aligns with the CQRS pattern:

- **Read Optimization**: Query-service has denormalized data optimized for dashboard queries
- **Single Call**: Get restaurants, products, ratings, categories in one place
- **Eventual Consistency**: Dashboard data doesn't need real-time accuracy
- **Separation of Concerns**: Write operations go to command services, reads go to query service

### Service Dependency Diagram

```
                    ┌─────────────────┐
                    │ dashboard-service│
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │query-service│  │order-service│  │catalog-svc  │
    │ (CQRS read) │  │(transaction)│  │(reference)  │
    └─────────────┘  └─────────────┘  └─────────────┘
           │                                  ▲
           │                                  │
           ▼                                  │
    ┌─────────────┐                          │
    │review-events│─┐                        │
    └─────────────┘ │                        │
                     │ (via RabbitMQ)         │
                     ▼                        │
              ┌─────────────┐                │
              │review-service│───────────────┘
              │(write side) │ (rating analytics)
              └─────────────┘
```
